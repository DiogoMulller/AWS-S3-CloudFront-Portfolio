# Guia de deploy e operação — Portfólio AWS

## Requisitos

- Conta AWS com permissões para S3, CloudFront e AWS Budgets.
- Arquivos do site estático, com `index.html` na raiz.
- Revisão de custos, créditos e plano da conta antes do provisionamento.

## 1. S3

1. Crie um bucket de uso geral na região desejada (no laboratório: `sa-east-1`).
2. Mantenha **Block Public Access** habilitado.
3. Use o endpoint REST do S3 como origem do CloudFront, **não** o endpoint `s3-website`.
4. Faça upload do conteúdo da pasta local, sem criar uma subpasta extra ao redor dos arquivos.
5. Confira se `index.html`, `style.css`, `script.js` e `assets/` estão na raiz.

## 2. CloudFront

1. Crie uma distribuição padrão, tipo de origem **Amazon S3**.
2. Selecione o bucket no assistente.
3. Mantenha `Origin path` vazio (para arquivos na raiz).
4. Ative a configuração recomendada que concede **acesso privado ao S3 por CloudFront (OAC)**.
5. Confirme se a política foi atualizada para a distribuição; não publique o bucket para corrigir um eventual `403`.
6. Na aba **General > Settings > Edit**, configure `Default root object = index.html`.
7. Use o domínio CloudFront fornecido e verifique a navegação por HTTPS.

### Política S3 e OAC

Não copie uma política de acesso irrestrito da internet. Quando precisar revisar manualmente, verifique no console se as permissões `s3:GetObject` usam o principal `cloudfront.amazonaws.com` e uma condição `AWS:SourceArn` restrita ao ARN da distribuição correspondente. O assistente pode escrever a política automaticamente. O acesso direto aos arquivos do bucket deve continuar bloqueado a usuários anônimos.

## 3. Atualizar versões

Após testar as mudanças localmente:

1. Envie os arquivos modificados ao mesmo bucket S3 e às mesmas chaves.
2. No CloudFront, vá a **Invalidations > Create invalidation**.
3. Invalide somente os arquivos alterados, por exemplo:

```text
/index.html
/style.css
/script.js
```

Para substituir tudo de uma vez, `/*` é possível, mas evite fazer invalidações gerais desnecessárias. Em projetos com atualizações recorrentes, prefira nomes de assets versionados e automação.

## 4. Verificações sugeridas

- Página principal e links internos carregando corretamente.
- Arquivos CSS, JS e SVG acessíveis via CloudFront.
- Nenhum erro 403/404 no painel Network do navegador.
- Layout responsivo e navegação por teclado.
- Bucket inacessível diretamente por usuário não autenticado.
- Métricas e orçamento AWS sendo monitorados.

## 5. Diagnóstico de erros

| Sintoma | Verificações |
|---|---|
| `403 AccessDenied` | Arquivo realmente existe na chave solicitada? OAC e política permitem `s3:GetObject` à distribuição? |
| `404` | Nome e maiúsculas/minúsculas do arquivo estão corretos? `Origin path` está vazio? |
| Página sem CSS/JS | Verificar caminhos relativos e arquivos na pasta correta do S3. |
| Site abre em `/index.html` mas não em `/` | Configurar `Default root object = index.html`. |
| Estilos antigos | Aguardar expiração do cache ou criar invalidação dos arquivos modificados. |

## 6. Custos e proteção

O orçamento mensal de laboratório é US$ 1 e alerta nos marcos de 20%, 50% e 100% de custo previsto. Um orçamento não interrompe serviços automaticamente; acompanhe o Billing e mantenha alertas ativos. Observe também a validade e a elegibilidade dos créditos, sem divulgar dados de cobrança em repositórios públicos.

## Documentação AWS

- https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html
- https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.SimpleDistribution.html
- https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html
