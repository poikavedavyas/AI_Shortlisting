from datetime import datetime

def log(message: str):
    """
    Prints a timestamped log message to the terminal called by all modules to track what is happening.
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")