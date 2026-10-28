#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
mkdir -p output

# Três passagens estabilizam a paginação, o sumário e as referências.
for passagem in 1 2 3; do
  xelatex -interaction=nonstopmode -halt-on-error \
    -output-directory=output -jobname=documento_de_visao header.tex
done

rm -f -- output/documento_de_visao.{log,aux,out,toc}
printf 'PDF gerado em: %s/output/documento_de_visao.pdf\n' "$PWD"
