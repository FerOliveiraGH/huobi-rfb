# Gerador de Arquivo RFB
Gerador de arquivo RFB [IN 1888](http://normas.receita.fazenda.gov.br/sijut2consulta/link.action?visao=anotado&idAto=100592) para exchange Binance.

## Instalar
### [YARN](https://yarnpkg.com/)
- Comando: `yarn add exchanges-rfb`

### [NPM](http://npmjs.org/)
- Comando: `npm install exchanges-rfb --save`

## Como Usar
- Crie o arquivo `.env` a partir do `.env.example` e preencha com as suas credências de API da Binance.
- Alterar o arquivo index.js para os pares que você utiliza.
- Ajuste o ano e o mês que ira gerar o arquivo.
- Execute o comando: `yarn start` ou `npm run start` para gerar o arquivo RFB.
- O arquivo ira parecer na pasta `rfbs` na raiz do projeto.

## Observações
- **Não me responsabilizo** por quaisquer dados enviado a **Receita Federal do Brasil** gerado através dessa aplicação.
- Essa aplicação é destinada a pessoas que tem o conhecimento necessário para realizar tal operação. 
- Essa aplicação é destinada para pessoas que tem o mínimo de conhecimento em **Javascript**.