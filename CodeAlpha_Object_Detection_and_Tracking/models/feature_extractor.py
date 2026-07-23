import torch
import torch.nn as nn
import torchvision.transforms as transforms
import numpy as np
from PIL import Image


class ReIDFeatureExtractor(nn.Module):
    """
    Lightweight Deep Learning Visual Appearance Feature Extractor.
    Extracts 128-d normalized embedding vectors from object bounding box crops.
    """

    def __init__(self, feature_dim: int = 128):
        super(ReIDFeatureExtractor, self).__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((4, 4))
        )
        self.fc = nn.Linear(64 * 4 * 4, feature_dim)
        
        self.transform = transforms.Compose([
            transforms.Resize((128, 64)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.to(self.device)
        self.eval()

    def forward(self, x):
        x = self.conv(x)
        x = x.view(x.size(0), -1)
        x = self.fc(x)
        # L2 Normalize feature vectors
        norm = x.norm(p=2, dim=1, keepdim=True)
        return x.div(norm.clamp(min=1e-12))

    def extract_features(self, frame_bgr: np.ndarray, bboxes_tlwh: list) -> np.ndarray:
        """Extracts 128-d normalized embeddings for a list of [x, y, w, h] crops."""
        if len(bboxes_tlwh) == 0:
            return np.empty((0, 128))

        tensors = []
        h_img, w_img = frame_bgr.shape[:2]

        for bbox in bboxes_tlwh:
            x, y, w, h = [int(v) for v in bbox]
            # Clip bounds safely
            x1, y1 = max(0, x), max(0, y)
            x2, y2 = min(w_img, x + w), min(h_img, y + h)

            if x2 <= x1 or y2 <= y1:
                crop = np.zeros((64, 128, 3), dtype=np.uint8)
            else:
                crop = frame_bgr[y1:y2, x1:x2]
                crop = cv2_bgr_to_rgb(crop)

            pil_img = Image.fromarray(crop)
            tensor = self.transform(pil_img)
            tensors.append(tensor)

        batch_tensor = torch.stack(tensors).to(self.device)
        with torch.no_grad():
            embeddings = self.forward(batch_tensor).cpu().numpy()

        return embeddings


def cv2_bgr_to_rgb(img_bgr: np.ndarray) -> np.ndarray:
    """Converts BGR OpenCV image to RGB."""
    return img_bgr[:, :, ::-1]
