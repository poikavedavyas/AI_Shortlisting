import fitz
from core.logger import log


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Takes raw PDF bytes received from HTTP upload. Extracts and returns all text as a plain string.
    """
    try:
        log("Starting PDF text extraction")

        doc = fitz.open(stream=file_bytes, filetype="pdf")

        log(f"PDF opened successfully — {doc.page_count} page(s) found")

        all_text = ""
        for page_number, page in enumerate(doc):
            page_text = page.get_text()
            all_text += page_text
            log(f"Page {page_number + 1} extracted — {len(page_text)} characters")

        all_text = all_text.strip()

        if not all_text:
            log("WARNING: No text extracted — PDF may be scanned or image-based")
            return ""

        log(f"PDF extraction complete — {len(all_text)} total characters extracted")
        return all_text

    except Exception as e:
        log(f"ERROR: PDF extraction failed — {str(e)}")
        return ""
    

