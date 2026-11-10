# Editorial stock photography

Retrieved 2026-11-10. All seven photos are used under the [Pexels License](https://www.pexels.com/license/), which permits free website use and modification. This is a free stock license, not a blanket CC0 or open-source license. Attribution is retained even though it is optional.

These images illustrate topics and planned programmes. They do not depict Nordeo staff, participants, or events, and do not imply the photographers' or subjects' endorsement of Nordeo.

| Local name | Photographer | Source | Used for |
| --- | --- | --- | --- |
| research-library | Yan Krukau | [Photo 8199762](https://www.pexels.com/photo/people-studying-in-library-8199762/) | Open research story, Research Notes desk, publishing module |
| writing-desk | Negative Space | [Photo 34607](https://www.pexels.com/photo/coffee-notebook-writing-computer-34607/) | Draft seminar and editor's note |
| peer-discussion | Startup Stock Photos | [Photo 7097](https://www.pexels.com/photo/group-of-people-having-a-meeting-7097/) | Reviewer response seminar |
| conference-hall | Mitchel Onwuchuruba | [Photo 31584584](https://www.pexels.com/photo/vast-indoor-conference-hall-with-large-audience-31584584/) | Planned academic conference |
| research-presentation | Felicity Tai | [Photo 7964167](https://www.pexels.com/photo/woman-writing-on-a-whiteboard-7964167/) | Presentation workshop |
| evidence-review | Yan Krukau | [Photo 7691673](https://www.pexels.com/photo/two-people-discussing-graphs-on-printouts-7691673/) | Evidence/policy story, Policy Brief desk, academic integrity module |
| community-study | Ludovic Delot | [Photo 16420473](https://www.pexels.com/photo/a-group-of-students-sitting-in-a-library-and-studying-16420473/) | Campus/community story and desk |

Original JPEGs are preserved in `assets-src/photos/`. `manifest.json` records original dimensions, download URLs, photographers, licensing, output dimensions, and byte sizes. Every master is native UHD **3840 × 2160**; no source is upscaled. Center crops use EXIF orientation correction, Lanczos resampling, and WebP quality 85. Responsive variants at 640, 1280 and 1920 pixels use quality 80. Colour and sharpness otherwise remain as photographed.

Rebuild with `py -3 scripts/prepare-editorial-photos.py` (Python + Pillow + curl.exe). Existing originals are reused; there is no remote dependency when serving the site. Do not redistribute this folder as a stock photo collection.
