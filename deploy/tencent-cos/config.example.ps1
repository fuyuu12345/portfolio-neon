# 参数写在同目录 config.local.ps1（已 gitignore），不要提交密钥
# 复制本文件为 config.local.ps1 后填写：

$Bucket = "jiadeng-xxxxx"          # 存储桶名称，不含 -appid 后缀时按控制台完整名填
$Region = "ap-shanghai"            # 如 ap-beijing / ap-guangzhou
$SecretId = ""                     # 腾讯云 API 密钥，勿发到聊天
$SecretKey = ""
$CosCli = "$env:USERPROFILE\coscli\coscli.exe"  # coscli 路径，按实际修改
