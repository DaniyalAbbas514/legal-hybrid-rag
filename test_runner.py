import asyncio
import sys
import json
from pathlib import Path

# Add backend directory to sys.path
backend_path = Path("c:/Projects/legal-hybrid-rag/backend")
sys.path.append(str(backend_path))

from app.ingestion.parser import parse_sections

async def test_file(pdf_id: str):
    txt_path = backend_path / "uploads" / f"{pdf_id}.txt"
    if not txt_path.exists():
        print(f"Error: {txt_path} does not exist.")
        return
        
    text = txt_path.read_text(encoding="utf-8", errors="ignore")
    print(f"\n==========================================")
    print(f"Testing PDF ID: {pdf_id} ({len(text)} chars)")
    print(f"==========================================")
    
    try:
        final = await parse_sections(pdf_id, text)
        print("=== PARSING RESULTS ===")
        print(f"Parse Mode: {final.get('parse_mode')}")
        print(f"Context Heading: {final.get('context_heading')}")
        print(f"Context Summary: {final.get('context_summary')}")
        
        # Verify 3 sentences in summary
        summary = final.get('context_summary', '')
        import re
        sentences = re.split(r"(?<=[.!?])\s+", summary.strip())
        sentences = [s for s in sentences if s.strip()]
        print(f"Summary sentences count: {len(sentences)}")
        for idx, s in enumerate(sentences):
            print(f"  Sentence {idx+1}: {s}")
            
        print("\n=== SECTIONS ===")
        for s in final.get("sections", []):
            st = s.get("section_type")
            txt = s.get("text", "")
            char_count = len(txt)
            lines_count = len(txt.splitlines()) if txt else 0
            preview = txt[:200].replace("\n", " ") if txt else "(EMPTY)"
            print(f"- {st}: {char_count} chars, {lines_count} lines, conf={s.get('confidence', 0):.1f}")
            print(f"  Preview: {preview}...")
            
    except Exception as e:
        print(f"Parsing failed with error:")
        import traceback
        traceback.print_exc()

async def main():
    # Find all txt files in the uploads directory
    txt_files = list((backend_path / "uploads").glob("*.txt"))
    pdf_ids = [f.stem for f in txt_files]
    
    print(f"Found {len(pdf_ids)} text files to test.")
    
    for pdf_id in pdf_ids:
        # Delete existing sections JSON to force parsing
        json_path = backend_path / "uploads" / f"{pdf_id}_sections.json"
        md_path = backend_path / "uploads" / f"{pdf_id}_summary.md"
        if json_path.exists():
            json_path.unlink()
        if md_path.exists():
            md_path.unlink()
            
        await test_file(pdf_id)

if __name__ == "__main__":
    asyncio.run(main())
