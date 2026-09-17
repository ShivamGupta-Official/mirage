"""
MIRAGE ML / PyTorch Training Skeleton
Provides a modular template for training deep learning models:
- Command-line hyperparameter parsing (argparse)
- Automated device selection (CUDA / MPS / CPU)
- Reproducible random seeding
- Epoch-level loss logging & metrics tracking
- Checkpoint persistence (.pt/.pth)
"""
import argparse
import logging
import os
import random
import sys
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("train")


def parse_args():
    parser = argparse.ArgumentParser(description="MIRAGE PyTorch Model Training Loop")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=64, help="Mini-batch size")
    parser.add_argument("--lr", type=float, default=1e-3, help="Learning rate")
    parser.add_argument("--weight-decay", type=float, default=1e-4, help="L2 regularization factor")
    parser.add_argument("--device", type=str, default="auto", choices=["auto", "cuda", "cpu", "mps"], help="Hardware compute device")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--checkpoint-dir", type=str, default="models", help="Directory to save model checkpoints")
    parser.add_argument("--data-dir", type=str, default="data", help="Root data directory containing raw/processed sets")
    return parser.parse_args()


def set_seed(seed: int):
    """Ensure deterministic experiments across Python, NumPy, and PyTorch."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False


def select_device(preferred: str = "auto") -> torch.device:
    """Select compute hardware device based on preference and system availability."""
    if preferred == "cuda" and torch.cuda.is_available():
        device = torch.device("cuda")
    elif preferred == "mps" and hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        device = torch.device("mps")
    elif preferred == "cpu":
        device = torch.device("cpu")
    else:
        # Auto-detect best available
        if torch.cuda.is_available():
            device = torch.device("cuda")
        elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            device = torch.device("mps")
        else:
            device = torch.device("cpu")
    
    logger.info(f"Selected compute device: {device} ({torch.cuda.get_device_name(0) if device.type == 'cuda' else 'Host CPU'})")
    return device


# =============================================================================
# MODEL ARCHITECTURE (PLACEHOLDER / TODO)
# =============================================================================
class ModelPlaceholder(nn.Module):
    """
    Placeholder feedforward/1D-CNN network for network threat classification.
    TODO: Replace with your specialized model architecture (e.g. Temporal Flow Autoencoder, LSTM, or ResNet-1D).
    """
    def __init__(self, input_dim: int = 12, num_classes: int = 6):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


# =============================================================================
# DATA LOADING (PLACEHOLDER / TODO)
# =============================================================================
def get_dataloaders(data_dir: str, batch_size: int):
    """
    Placeholder DataLoader loader.
    TODO: Replace synthetic tensors with your actual dataset pipeline from data/processed/.
    """
    logger.info(f"Loading datasets from '{data_dir}' (Using synthetic placeholder tensor for pipeline validation)...")
    # Synthetic placeholder: 12 input features, 6 target threat classes
    X_train = torch.randn(1000, 12)
    y_train = torch.randint(0, 6, (1000,))
    X_val = torch.randn(200, 12)
    y_val = torch.randint(0, 6, (200,))

    train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(TensorDataset(X_val, y_val), batch_size=batch_size, shuffle=False)
    return train_loader, val_loader


# =============================================================================
# MAIN TRAINING LOOP
# =============================================================================
def train():
    args = parse_args()
    set_seed(args.seed)
    device = select_device(args.device)
    os.makedirs(args.checkpoint_dir, exist_ok=True)

    # 1. Initialize Data
    train_loader, val_loader = get_dataloaders(args.data_dir, args.batch_size)

    # 2. Instantiate Model, Loss Function, and Optimizer
    # TODO: Configure input dimensions and classes according to your actual feature schema
    model = ModelPlaceholder(input_dim=12, num_classes=6).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)

    logger.info("Starting training loop:")
    logger.info(f"  Epochs:       {args.epochs}")
    logger.info(f"  Batch Size:   {args.batch_size}")
    logger.info(f"  Learning Rate:{args.lr}")
    logger.info(f"  Checkpoints:  {args.checkpoint_dir}/")

    best_val_loss = float("inf")

    for epoch in range(1, args.epochs + 1):
        start_time = time.time()
        
        # --- Training Phase ---
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for batch_idx, (inputs, targets) in enumerate(train_loader):
            inputs, targets = inputs.to(device), targets.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            _, predicted = outputs.max(1)
            total += targets.size(0)
            correct += predicted.eq(targets).sum().item()

        epoch_train_loss = running_loss / total
        epoch_train_acc = 100.0 * correct / total

        # --- Validation Phase ---
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for inputs, targets in val_loader:
                inputs, targets = inputs.to(device), targets.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, targets)

                val_loss += loss.item() * inputs.size(0)
                _, predicted = outputs.max(1)
                val_total += targets.size(0)
                val_correct += predicted.eq(targets).sum().item()

        epoch_val_loss = val_loss / val_total
        epoch_val_acc = 100.0 * val_correct / val_total
        elapsed = time.time() - start_time

        logger.info(
            f"Epoch [{epoch:02d}/{args.epochs:02d}] "
            f"Train Loss: {epoch_train_loss:.4f} (Acc: {epoch_train_acc:.2f}%) | "
            f"Val Loss: {epoch_val_loss:.4f} (Acc: {epoch_val_acc:.2f}%) | "
            f"Duration: {elapsed:.2f}s"
        )

        # --- Checkpoint Saving ---
        if epoch_val_loss < best_val_loss:
            best_val_loss = epoch_val_loss
            checkpoint_path = os.path.join(args.checkpoint_dir, "best_model.pt")
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_loss": best_val_loss,
                "val_acc": epoch_val_acc,
                "args": vars(args),
            }, checkpoint_path)
            logger.info(f"  -> Saved new best checkpoint to {checkpoint_path}")

    logger.info("Training complete!")


if __name__ == "__main__":
    train()
