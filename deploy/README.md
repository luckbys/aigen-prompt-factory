# Executar na VPS com Docker

Requisitos: Git, Docker Engine com BuildKit e Docker Compose v2. A VPS não precisa de Node.js, npm ou Nginx instalados. Use a branch que contém estes arquivos, ou `main` após o merge do PR.

## Primeira execução

```sh
git clone https://github.com/luckbys/aigen-prompt-factory.git
cd aigen-prompt-factory
cp .env.example .env
# Ajuste APP_PORT e BIND_ADDRESS no .env, se necessário.
docker compose up -d --build --wait
docker compose ps
curl --fail http://127.0.0.1:8080/healthz
```

Com os valores padrão, abra `http://IP_DA_VPS:8080` e libere a porta TCP 8080 no firewall da VPS/provedor. Se alterar `APP_PORT`, use a mesma porta nos comandos e no firewall. Caso a porta 8080 esteja ocupada, escolha outra em `.env`. Para HTTP na porta 80, use `APP_PORT=80` se ela estiver livre.

O build instala pelo lockfile, verifica tipos, executa os testes e compila o frontend. Apenas o Nginx e os arquivos estáticos ficam na imagem final. O container roda como usuário `nginx`, com filesystem somente leitura, diretório temporário em memória, logs com rotação e healthcheck. O Nginx disponibiliza `/healthz`, cache dos assets versionados e fallback para `index.html`.

## Domínio e HTTPS

Para usar um proxy reverso instalado na VPS, configure:

```dotenv
APP_PORT=8080
BIND_ADDRESS=127.0.0.1
```

Recrie o serviço com `docker compose up -d --wait` e aponte o proxy para `http://127.0.0.1:8080`. O HTTPS é terminado pelo proxy; este Compose serve HTTP. Por exemplo, se você já usa Caddy na VPS, configure o domínio no seu Caddyfile:

```caddyfile
app.seudominio.com {
    reverse_proxy 127.0.0.1:8080
}
```

Aponte o DNS para a VPS e disponibilize as portas 80/443 para esse proxy. Se o proxy também roda em Docker, `127.0.0.1` se refere ao próprio container: conecte ambos à mesma rede Docker e use o serviço `app` na porta interna 8080.

## Atualizar, inspecionar e parar

```sh
git pull --ff-only
docker compose up -d --build --wait
docker compose logs --tail=100 -f app
docker compose down
```

Execute `logs` quando precisar diagnosticar; `down` para parar/remover os containers. O restart automático depende de o serviço Docker estar habilitado para iniciar com a VPS. Os prompts são armazenados no navegador de cada usuário, portanto não há volume de banco de dados no servidor. O armazenamento do navegador pertence à origem: mudar domínio, porta ou HTTP para HTTPS não migra os prompts automaticamente.

## Configuração e integrações

`.env` configura somente a porta e o endereço publicados pelo Compose; ele não é copiado para a imagem. Este é um frontend Vite estático: variáveis adicionadas ao container em runtime não alteram o JavaScript compilado. Não coloque chaves privadas no frontend ou em argumentos de build. A configuração Docker não modifica o serviço Gemini nem corrige permissões/CORS dos webhooks; consulte as limitações de integração no README principal.

## Build atrás de proxy com CA própria

Em uma VPS com acesso direto à Internet, basta o comando Compose acima. Para um ambiente com inspeção HTTPS, o Dockerfile aceita uma CA opcional via secret do BuildKit, sem gravá-la na imagem:

```sh
docker build --secret id=proxy_ca,src=/caminho/ca-do-proxy.pem -t aigen-prompt-factory:local .
docker compose up -d --no-build --wait
```

Mantenha a verificação TLS habilitada e a configuração de proxy apropriada no Docker.
