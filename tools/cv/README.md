# Currículo — como atualizar

Todo o conteúdo do CV está num só ficheiro: **`tools/cv/cv-data.mjs`** (português e inglês).
A partir dele são gerados:

| Ficheiro | Para quê |
|---|---|
| `cv.html` | CV interativo do portfólio (fotografia, tema claro/escuro, PT/EN) |
| `assets/cv/Jorge_Lourenco_Sumbane_CV_PT.pdf` | CV para recrutamento, em português (A4, preparado para ATS, sem fotografia) |
| `assets/cv/Jorge_Lourenco_Sumbane_CV_EN.pdf` | O mesmo, em inglês |

## Atualizar

1. Edite `tools/cv/cv-data.mjs`.
2. Na raiz do portfólio, execute:

   ```bash
   node tools/cv/build-cv.mjs
   ```

   É preciso o Node.js (22 ou mais recente) e o Google Chrome ou o Microsoft Edge instalados.
   Para indicar outro navegador: `CHROME_PATH="caminho/para/chrome" node tools/cv/build-cv.mjs`.
3. Publique as alterações (os três ficheiros gerados mudam juntos).

Não edite `cv.html` nem os PDFs à mão: são substituídos sempre que o gerador corre.

## Secções por confirmar

- **Experiência profissional** (`experience`) e **Idiomas** (`languages`) estão vazias de propósito:
  só aparecem no CV quando tiverem dados reais. O ficheiro tem um modelo comentado para cada uma.
- Na versão PDF aparecem os projetos com `pdf: true`; os restantes ficam numa linha "Outros projetos".
