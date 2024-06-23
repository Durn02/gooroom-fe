import logging
import os
from colorama import Fore

COLORS = [
    Fore.LIGHTRED_EX,
    Fore.LIGHTGREEN_EX,
    Fore.LIGHTYELLOW_EX,
    Fore.LIGHTBLUE_EX,
    Fore.LIGHTMAGENTA_EX,
    Fore.LIGHTCYAN_EX,
    Fore.LIGHTWHITE_EX,
    Fore.LIGHTBLACK_EX,
]


class Logger:
    def __init__(self, name):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        self.pid = os.getpid()
        color = COLORS[self.pid % len(COLORS)]
        formatter = logging.Formatter(
            f"{color}[%(asctime)s] {self.pid} {Fore.GREEN}%(levelname)s {Fore.WHITE}%(name)s {Fore.YELLOW}%(message)s"
        )
        stream_handler = logging.StreamHandler()
        stream_handler.setFormatter(formatter)
        self.logger.addHandler(stream_handler)

    def info(self, msg):
        self.logger.setLevel(logging.INFO)
        self.logger.info(msg)

    def debug(self, msg):
        self.logger.setLevel(logging.DEBUG)
        self.logger.debug(msg)

    def warning(self, msg):
        self.logger.setLevel(logging.WARNING)
        self.logger.warning(msg)

    def error(self, msg):
        self.logger.setLevel(logging.ERROR)
        self.logger.error(msg)

    def critical(self, msg):
        self.logger.setLevel(logging.CRITICAL)
        self.logger.critical(msg)

    def get_logger(self):
        return self.logger
