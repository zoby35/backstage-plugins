## Installing

<details>
  <summary>Linux AMD64</summary>

  ### Download
  ```bash
  wget https://github.com/TeraSky-OSS/backstage-plugins/releases/download/CLI-0.0.1/backstage-config-generator_linux_amd64
  wget https://github.com/TeraSky-OSS/backstage-plugins/releases/download/CLI-0.0.1/backstage-config-generator_linux_amd64.cert
  wget https://github.com/TeraSky-OSS/backstage-plugins/releases/download/CLI-0.0.1/backstage-config-generator_linux_amd64.sig
  ```
  ### Verify Signature
  ```bash
  cosign verify-blob backstage-config-generator_linux_amd64 \
    --certificate backstage-config-generator_linux_amd64.cert \
    --signature backstage-config-generator_linux_amd64.sig \
    --certificate-oidc-issuer https://token.actions.githubusercontent.com \
    --certificate-identity-regexp='https://github.com/TeraSky-OSS/backstage-plugins/\.github/workflows/cli.yaml.+'
  ```
  ### Install
  ```bash
  chmod +x backstage-config-generator_linux_amd64
  sudo mv backstage-config-generator_linux_amd64 /usr/local/bin/backstage-config-generator
  ```
</details>

<details>
  <summary>Linux ARM64</summary>

  ### Download
  ```bash
  wget https://github.com/TeraSky-OSS/backstage-plugins/releases/download/CLI-0.0.1/backstage-config-generator_linux_arm64
  wget https://github.com/TeraSky-OSS/backstage-plugins/releases/download/CLI-0.0.1/backstage-config-generator_linux_arm64.cert
  wget https://github.com/TeraSky-OSS/backstage-plugins/releases/download/CLI-0.0.1/backstage-config-generator_linux_arm64.sig
  ```
  ### Verify Signature
  ```bash
  cosign verify-blob backstage-config-generator_linux_arm64 \
    --certificate backstage-config-generator_linux_arm64.cert \
    --signature backstage-config-generator_linux_arm64.sig \
    --certificate-oidc-issuer https://token.actions.githubusercontent.com \
    --certificate-identity-regexp='https://github.com/TeraSky-OSS/backstage-plugins/\.github/workflows/cli.yaml.+'
  ```
  ### Install
  ```bash
  chmod +x backstage-config-generator_linux_arm64
  sudo mv backstage-config-generator_linux_arm64 /usr/local/bin/backstage-config-generator
  ```
</details>

<details>
  <summary>MacOS AMD64</summary>

  ### Download
  ```bash
  wget https://github.com/TeraSky-OSS/backstage-plugins/releases/download/CLI-0.0.1/backstage-config-generator_darwin_amd64
  wget https://github.com/TeraSky-OSS/backstage-plugins/releases/download/CLI-0.0.1/backstage-config-generator_darwin_amd64.cert
  wget https://github.com/TeraSky-OSS/backstage-plugins/releases/download/CLI-0.0.1/backstage-config-generator_darwin_amd64.sig
  ```
  ### Verify Signature
  ```bash
  cosign verify-blob backstage-config-generator_darwin_amd64 \
    --certificate backstage-config-generator_darwin_amd64.cert \
    --signature backstage-config-generator_darwin_amd64.sig \
    --certificate-oidc-issuer https://token.actions.githubusercontent.com \
    --certificate-identity-regexp='https://github.com/TeraSky-OSS/backstage-plugins/\.github/workflows/cli.yaml.+'
  ```
  ### Install
  ```bash
  chmod +x backstage-config-generator_darwin_amd64
  sudo mv backstage-config-generator_darwin_amd64 /usr/local/bin/backstage-config-generator
  ```
</details>

<details>
  <summary>MacOS ARM64</summary>

  ### Download
  ```bash
  wget https://github.com/TeraSky-OSS/backstage-plugins/releases/download/CLI-0.0.1/backstage-config-generator_darwin_arm64
  wget https://github.com/TeraSky-OSS/backstage-plugins/releases/download/CLI-0.0.1/backstage-config-generator_darwin_arm64.cert
  wget https://github.com/TeraSky-OSS/backstage-plugins/releases/download/CLI-0.0.1/backstage-config-generator_darwin_arm64.sig
  ```
  ### Verify Signature
  ```bash
  cosign verify-blob backstage-config-generator_darwin_arm64 \
    --certificate backstage-config-generator_darwin_arm64.cert \
    --signature backstage-config-generator_darwin_arm64.sig \
    --certificate-oidc-issuer https://token.actions.githubusercontent.com \
    --certificate-identity-regexp='https://github.com/TeraSky-OSS/backstage-plugins/\.github/workflows/cli.yaml.+'
  ```
  ### Install
  ```bash
  chmod +x backstage-config-generator_darwin_arm64
  sudo mv backstage-config-generator_darwin_arm64 /usr/local/bin/backstage-config-generator
  ```
</details>

<details>
  <summary>MacOS ARM64</summary>

  ### Download
  ```bash
  wget https://github.com/TeraSky-OSS/backstage-plugins/releases/download/CLI-0.0.1/backstage-config-generator_darwin_arm64
  wget https://github.com/TeraSky-OSS/backstage-plugins/releases/download/CLI-0.0.1/backstage-config-generator_darwin_arm64.cert
  wget https://github.com/TeraSky-OSS/backstage-plugins/releases/download/CLI-0.0.1/backstage-config-generator_darwin_arm64.sig
  ```
  ### Verify Signature
  ```bash
  cosign verify-blob backstage-config-generator_darwin_arm64 \
    --certificate backstage-config-generator_darwin_arm64.cert \
    --signature backstage-config-generator_darwin_arm64.sig \
    --certificate-oidc-issuer https://token.actions.githubusercontent.com \
    --certificate-identity-regexp='https://github.com/TeraSky-OSS/backstage-plugins/\.github/workflows/cli.yaml.+'
  ```
  ### Install
  ```bash
  chmod +x backstage-config-generator_darwin_arm64
  sudo mv backstage-config-generator_darwin_arm64 /usr/local/bin/backstage-config-generator
  ```
</details>

<details>
  <summary>Windows</summary>

  ### Download
  ```powershell
  Invoke-WebRequest -Uri https://github.com/TeraSky-OSS/backstage-plugins/releases/download/CLI-0.0.1/backstage-config-generator.exe -OutFile backstage-config-generator.exe
  Invoke-WebRequest -Uri https://github.com/TeraSky-OSS/backstage-plugins/releases/download/CLI-0.0.1/backstage-config-generator.exe.cert -OutFile backstage-config-generator.exe.cert
  Invoke-WebRequest -Uri https://github.com/TeraSky-OSS/backstage-plugins/releases/download/CLI-0.0.1/backstage-config-generator.exe.sig -OutFile backstage-config-generator.exe.sig
  ```
  
  ### Verify Signature
  ```powershell
  cosign verify-blob backstage-config-generator.exe `
    --certificate backstage-config-generator.exe.cert `
    --signature backstage-config-generator.exe.sig `
    --certificate-oidc-issuer https://token.actions.githubusercontent.com `
    --certificate-identity-regexp='https://github.com/TeraSky-OSS/backstage-plugins/\.github/workflows/cli.yaml.+'
  ```

  ### Install
  ```powershell
  Move-Item -Path .\backstage-config-generator.exe -Destination "C:\Program Files\backstage-config-generator\backstage-config-generator.exe"
  [System.Environment]::SetEnvironmentVariable("Path", $Env:Path + ";C:\Program Files\backstage-config-generator\", [System.EnvironmentVariableTarget]::Machine)
  ```
</details>
