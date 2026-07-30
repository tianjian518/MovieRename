from typing import Optional


class SitesHelper:
    """
    MovieRename 已移除站点/索引器相关功能，此处仅保留兼容垫片。
    原 SitesHelper 提供的站点认证与索引器元数据在当前版本中不再使用，
    相关属性返回安全默认值，避免对保留代码造成导入或运行时异常。
    """

    @property
    def auth_level(self) -> int:
        return 0

    @property
    def auth_version(self) -> str:
        return ""

    @property
    def indexer_version(self) -> str:
        return ""

    def check_user(self, *args, **kwargs) -> tuple[bool, str]:
        return False, "MovieRename 已移除站点认证"
