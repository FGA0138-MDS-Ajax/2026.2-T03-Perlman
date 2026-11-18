---
sessionId: session-261117-230847-19pz
---

# Próximos Passos para Deploy

## Visão Geral

A infraestrutura de deploy do MotivaFit está **completamente configurada** nos arquivos. Todos os componentes necessários já foram criados:

- ✅ **Terraform** — 5 módulos (VPC, RDS, ECS, ALB, ECR) em `infra/terraform/`
- ✅ **Docker** — Dockerfiles do frontend e backend, docker-compose dev e prod
- ✅ **Nginx** — Configuração de produção em `infra/nginx/nginx.prod.conf`
- ✅ **CI/CD** — Pipeline GitHub Actions em `.github/workflows/ci-cd.yml`
- ✅ **Documentação** — `infra/README.md` com arquitetura e instruções

O que falta são os **passos de execução** para colocar tudo no ar.

---

## Passo a Passo para Deploy

### 1. Configurar a conta AWS

- Criar uma conta AWS (se ainda não tiver)
- Criar um **IAM User** com permissões para:
  - EC2, ECS, ECR, ELB, RDS, VPC, CloudWatch, SSM, IAM
  - Ou anexar a política `AdministratorAccess` (apenas para desenvolvimento)
- Gerar as credenciais de acesso (`AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`)

### 2. Configurar o Terraform localmente

```
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars

# Edite terraform.tfvars com:

# - db_username e db_password (senha forte!)

# - aws_region (ex: us-east-1)

# - db_multi_az = false (para reduzir custos em dev)

```

### 3. Aplicar a infraestrutura na AWS

```
cd infra/terraform
terraform init
terraform plan   # revise o que será criado
terraform apply  # confirme com "yes"
```

Após o `apply`, o Terraform vai exibir os outputs importantes:
- `rds_address` — endpoint do banco de dados
- `alb_dns_name` — URL do load balancer
- `ecr_frontend_repo_url` e `ecr_backend_repo_url` — URLs dos repositórios Docker

### 4. Configurar os GitHub Secrets

No repositório do GitHub, vá em **Settings → Secrets and variables → Actions** e adicione:

| Secret | Valor |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | Sua chave de acesso AWS |
| `AWS_SECRET_ACCESS_KEY` | Sua chave secreta AWS |
| `JWT_SECRET` | Gere com: `openssl rand -base64 64` |
| `JWT_ISSUER` | `motivafit` |
| `DB_URL` | `jdbc:postgresql://<rds_address>:5432/motivafit` (do output do Terraform) |
| `DB_USER` | Usuário do banco (mesmo de `terraform.tfvars`) |
| `DB_PASSWORD` | Senha do banco (mesma de `terraform.tfvars`) |
| `CORS_ALLOWED_ORIGIN` | `https://<alb_dns_name>` ou seu domínio |

### 5. Executar o primeiro deploy

Faça um **merge na branch `main`** (ou push direto se estiver na main). O GitHub Actions vai:
1. Rodar lint e testes do frontend e backend
2. Buildar as imagens Docker
3. Fazer push para o ECR
4. Deployar nos serviços ECS (frontend e backend)

### 6. Verificar o deploy

- Acesse o `alb_dns_name` retornado pelo Terraform no navegador
- O frontend deve carregar e o backend deve responder em `/api/`
- No AWS Console → ECS, verifique se as tasks estão rodando
- No AWS Console → CloudWatch, verifique os logs

---

## Opcional: Configurar Domínio e HTTPS

Para produção, recomenda-se:
1. Comprar um domínio (ex: Route 53, GoDaddy, etc.)
2. Criar um registro A apontando para o ALB
3. Configurar HTTPS com certificado no AWS Certificate Manager (ACM)
4. Atualizar o listener do ALB para HTTPS (requer alteração no Terraform)

---

## Resumo do que cada etapa faz

| Etapa | O que acontece | Tempo estimado |
|-------|---------------|----------------|
| 1. Configurar AWS | Criar conta e credenciais IAM | 10 min |
| 2. Configurar Terraform | Copiar e editar `terraform.tfvars` | 5 min |
| 3. `terraform apply` | Criar VPC, RDS, ECS, ALB, ECR na AWS | 15-20 min |
| 4. GitHub Secrets | Adicionar credenciais no repositório | 5 min |
| 5. Merge na main | Pipeline CI/CD executa automaticamente | 10-15 min |
| 6. Verificar | Testar app no navegador | 5 min |

**Total estimado: ~45 minutos** para o primeiro deploy.

# Delivery Steps

## Deploy AWS (Produção)

###   Step 1: Configurar credenciais AWS e GitHub Secrets
Preparar o ambiente AWS e configurar os secrets necessários no GitHub para que a pipeline CI/CD funcione.

###   Step 2: Executar Terraform e validar infraestrutura
Aplicar o Terraform para criar toda a infraestrutura na AWS (VPC, RDS, ECS, ALB, ECR) e verificar os outputs.

## Deploy Render.com (Gratuito — Concluído ✓)

### ✓ Step 1: Criar render.yaml e application-render.yaml
- ✅ `render.yaml` com 3 serviços: PostgreSQL (free), Backend (Docker), Frontend (Static Site)
- ✅ `application-render.yaml` com perfil Spring Boot para Render (jdbc:postgresql://, cookies seguros, CORS)
- ✅ Variáveis de ambiente: DB_URL, DB_USER, DB_PASSWORD, JWT_SECRET, CORS_ALLOWED_ORIGIN

### ✓ Step 2: Atualizar nginx do frontend e criar documentação
- ✅ `nginx.conf` sem proxy do backend (serviços separados no Render)
- ✅ `.renderignore` para ignorar arquivos desnecessários
- ✅ `infra/README.md` com seção completa sobre deploy no Render
- ✅ `SecurityConfig.java` com `setExposedHeaders(Authorization)` para CORS
- ✅ `Dockerfile` backend com `CMD` para permitir startCommand do Render