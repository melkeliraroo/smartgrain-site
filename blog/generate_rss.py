#!/usr/bin/env python3
from pathlib import Path
import calendar
import json
import datetime
import email.utils
import xml.etree.ElementTree as ET
from xml.dom import minidom

BASE = 'https://smartgrain.com.br/blog/'
HERE = Path(__file__).parent
ARTIGOS = HERE / 'artigos.json'
OUT = HERE / 'rss.xml'

js = json.loads(ARTIGOS.read_text(encoding='utf-8'))

ET.register_namespace('content', 'http://purl.org/rss/1.0/modules/content/')
rss = ET.Element('rss', version='2.0', attrib={'xmlns:content':'http://purl.org/rss/1.0/modules/content/'})
channel = ET.SubElement(rss, 'channel')
ET.SubElement(channel, 'title').text = 'SmartGrain — Blog'
ET.SubElement(channel, 'link').text = BASE
ET.SubElement(channel, 'description').text = 'Artigos e insights sobre agricultura digital, telemetria e agricultura de precisão.'
ET.SubElement(channel, 'language').text = 'pt-BR'

# determine lastBuildDate from articles
dates = []
for a in js:
    d = a.get('data')
    if not d:
        continue
    for fmt in ('%Y-%m-%d', '%Y-%m-%dT%H:%M:%S'):
        try:
            dt = datetime.datetime.strptime(d, fmt)
            dates.append(dt)
            break
        except Exception:
            continue

if dates:
    last = max(dates)
    ts = calendar.timegm(last.timetuple())
    ET.SubElement(channel, 'lastBuildDate').text = email.utils.formatdate(ts, usegmt=True)

# helper to detect mime type by extension
def mime_for(path):
    path = path.lower()
    if path.endswith('.jpg') or path.endswith('.jpeg'):
        return 'image/jpeg'
    if path.endswith('.png'):
        return 'image/png'
    if path.endswith('.webp'):
        return 'image/webp'
    if path.endswith('.gif'):
        return 'image/gif'
    return 'application/octet-stream'

for a in js:
    item = ET.SubElement(channel, 'item')
    title = a.get('titulo') or a.get('titulo', '')
    ET.SubElement(item, 'title').text = title
    url = a.get('url') or ''
    link = BASE + url
    ET.SubElement(item, 'link').text = link
    guid = ET.SubElement(item, 'guid')
    guid.text = link
    guid.set('isPermaLink', 'true')

    desc = a.get('descricao') or ''
    ET.SubElement(item, 'description').text = desc

    d = a.get('data')
    if d:
        dt = None
        for fmt in ('%Y-%m-%d', '%Y-%m-%dT%H:%M:%S'):
            try:
                dt = datetime.datetime.strptime(d, fmt)
                break
            except Exception:
                continue
        if dt:
            ts = calendar.timegm(dt.timetuple())
            ET.SubElement(item, 'pubDate').text = email.utils.formatdate(ts, usegmt=True)

    cat = a.get('categoria')
    if cat:
        ET.SubElement(item, 'category').text = cat

    img = a.get('imagem')
    if img:
        enc = ET.SubElement(item, 'enclosure')
        enc_url = img if img.startswith('http') else (BASE + img)
        enc.set('url', enc_url)
        enc.set('type', mime_for(img))

# pretty print and write
raw = ET.tostring(rss, encoding='utf-8')
pretty = minidom.parseString(raw).toprettyxml(indent='  ', encoding='utf-8')
OUT.write_bytes(pretty)
print(f'Wrote {OUT}')
