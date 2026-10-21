#!/usr/bin/env python3
"""index.html + CSS + JS + data를 한 파일(mentor-offline.html)로 합칩니다.
태블릿·노트북에 저장해 인터넷 없이 더블클릭으로 열 때 사용합니다.
사용법: python3 tools/build_single.py   (data/*.js 수정 후 다시 실행)"""
import pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "assets/css/style.css").read_text(encoding="utf-8")
html = html.replace('<link rel="stylesheet" href="assets/css/style.css">', "<style>\n" + css + "\n</style>")
def inline(m):
    src = m.group(1)
    code = (root / src).read_text(encoding="utf-8").replace("</script", "<\\/script")
    return "<script>/* " + src + " */\n" + code + "\n</script>"
html = re.sub(r'<script src="([^"]+)"></script>', inline, html)
out = root / "mentor-offline.html"
out.write_text(html, encoding="utf-8")
print("written", out, len(html), "bytes")
