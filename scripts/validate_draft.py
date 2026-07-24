from __future__ import annotations

import re
import sys
from pathlib import Path


def fail(message: str) -> None:
    raise SystemExit(f"FALHA: {message}")


def section(text: str, start: str, end: str | None = None) -> str:
    try:
        body = text.split(start, 1)[1]
    except IndexError:
        fail(f"seção ausente: {start.strip()}")
    if end:
        try:
            body = body.split(end, 1)[0]
        except IndexError:
            fail(f"seção final ausente: {end.strip()}")
    return body.strip()


def main() -> None:
    if len(sys.argv) != 2:
        fail("uso: python scripts/validate_draft.py <diretorio-do-pacote>")

    package = Path(sys.argv[1])
    newsletter_path = package / "newsletter.txt"
    cover_path = package / "capa-newsletter.webp"

    if not package.is_dir():
        fail(f"diretório não encontrado: {package}")
    if not newsletter_path.is_file():
        fail("newsletter.txt ausente")
    if not cover_path.is_file() or cover_path.stat().st_size == 0:
        fail("capa-newsletter.webp ausente ou vazia")

    text = newsletter_path.read_text(encoding="utf-8")
    required_markers = [
        "TÍTULO",
        "SUBTÍTULO",
        "ARTIGO",
        "FONTES",
        "TEXTO PARA DIVULGAÇÃO NO FEED",
        "METADADOS EDITORIAIS E SEO",
        "PESQUISA E SELEÇÃO DA PAUTA",
        "FONTES COM ESCOPO DE EVIDÊNCIA",
        "REGISTRO DA CAPA E DA LICENÇA",
        "CHECKLIST DE REVISÃO E APROVAÇÃO HUMANA",
    ]
    for marker in required_markers:
        if marker not in text:
            fail(f"marcador obrigatório ausente: {marker}")

    title = section(text, "TÍTULO", "SUBTÍTULO")
    subtitle = section(text, "SUBTÍTULO", "ARTIGO")
    article = section(text, "ARTIGO", "FONTES")
    feed = section(text, "TEXTO PARA DIVULGAÇÃO NO FEED", "METADADOS EDITORIAIS E SEO")
    research = section(text, "PESQUISA E SELEÇÃO DA PAUTA", "FONTES COM ESCOPO DE EVIDÊNCIA")

    word_count = len(re.findall(r"\b[\wÀ-ÿ]+(?:[/'’][\wÀ-ÿ]+)*\b", article, re.UNICODE))
    if not 1500 <= word_count <= 2000:
        fail(f"artigo com {word_count} palavras; esperado entre 1.500 e 2.000")

    forbidden_dashes = {"—", "–"}
    for label, content in (
        ("título", title),
        ("subtítulo", subtitle),
        ("artigo", article),
        ("feed", feed),
    ):
        if any(char in content for char in forbidden_dashes):
            fail(f"travessão encontrado em {label}")

    if "Status: rascunho, não aprovado e não publicado" not in text:
        fail("status de rascunho não confirmado")
    if "Link da newsletter: inserir somente depois da publicação no LinkedIn." not in feed:
        fail("controle do link pós-publicação ausente")
    if "Smart Grain" in article:
        fail("artigo pessoal contém menção comercial à Smart Grain")

    seo_fields = [
        "Título SEO:",
        "Slug sugerido:",
        "Descrição SEO:",
        "Palavras-chave:",
        "Texto alternativo da capa:",
    ]
    for field in seo_fields:
        if field not in text:
            fail(f"metadado ausente: {field}")

    candidates = re.findall(r"(?m)^\d+\.\s+.+$", research)
    if not 3 <= len(candidates) <= 5:
        fail(f"{len(candidates)} pautas candidatas; esperado entre 3 e 5")
    if research.count("Pontuação:") != len(candidates):
        fail("pontuação incompleta para as pautas candidatas")
    if "Pauta escolhida:" not in research or "Pergunta decisória:" not in research:
        fail("seleção da pauta ou pergunta decisória ausente")

    if text.count("https://") < 6:
        fail("quantidade insuficiente de fontes com URL")
    if 'Licença registrada: AI-generated-original.' not in text:
        fail("licença da capa não registrada")
    if "Texto alternativo:" not in text:
        fail("texto alternativo da capa ausente")
    if "[ ]" not in text:
        fail("checklist de revisão humana ausente")

    try:
        from PIL import Image
    except ImportError:
        fail("Pillow não está disponível para validar a capa")

    with Image.open(cover_path) as image:
        if image.format != "WEBP":
            fail(f"formato da capa é {image.format}; esperado WEBP")
        width, height = image.size
        if width < 1200 or height < 627:
            fail(f"capa com dimensões insuficientes: {width}x{height}")

    print(
        "VALIDAÇÃO APROVADA\n"
        f"Pacote: {package.resolve()}\n"
        f"Artigo: {word_count} palavras\n"
        f"Pautas avaliadas: {len(candidates)}\n"
        f"Capa: {width}x{height} WEBP\n"
        "Status: rascunho, não aprovado e não publicado\n"
        "Travessões: nenhum em título, subtítulo, artigo ou feed"
    )


if __name__ == "__main__":
    main()
