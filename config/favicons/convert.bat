@ECHO OFF
set size=32
echo favicon-%size%x%size%.png...
magick src/assets/icon/favicon.png -resize %size%x%size% src/assets/icon/favicon-%size%x%size%.png

set size=16
echo favicon-%size%x%size%.png...
magick src/assets/icon/favicon.png -resize %size%x%size% src/assets/icon/favicon-%size%x%size%.png

set size=96
echo favicon-%size%x%size%.png...
magick src/assets/icon/favicon.png -resize %size%x%size% src/assets/icon/favicon-%size%x%size%.png

set size=144
echo ms-icon-%size%x%size%.png...
magick src/assets/icon/favicon.png -resize %size%x%size% src/assets/icon/ms-icon-%size%x%size%.png

set size=192
echo android-icon-%size%x%size%.png...
magick src/assets/icon/favicon.png -resize %size%x%size% src/assets/icon/android-icon-%size%x%size%.png

set size=57
echo apple-icon-%size%x%size%.png...
magick src/assets/icon/favicon.png -resize %size%x%size% src/assets/icon/apple-icon-%size%x%size%.png

set size=60
echo apple-icon-%size%x%size%.png...
magick src/assets/icon/favicon.png -resize %size%x%size% src/assets/icon/apple-icon-%size%x%size%.png

set size=72
echo apple-icon-%size%x%size%.png...
magick src/assets/icon/favicon.png -resize %size%x%size% src/assets/icon/apple-icon-%size%x%size%.png

set size=76
echo apple-icon-%size%x%size%.png...
magick src/assets/icon/favicon.png -resize %size%x%size% src/assets/icon/apple-icon-%size%x%size%.png

set size=114
echo apple-icon-%size%x%size%.png...
magick src/assets/icon/favicon.png -resize %size%x%size% src/assets/icon/apple-icon-%size%x%size%.png

set size=120
echo apple-icon-%size%x%size%.png...
magick src/assets/icon/favicon.png -resize %size%x%size% src/assets/icon/apple-icon-%size%x%size%.png

set size=144
echo apple-icon-%size%x%size%.png...
magick src/assets/icon/favicon.png -resize %size%x%size% src/assets/icon/apple-icon-%size%x%size%.png

set size=152
echo apple-icon-%size%x%size%.png...
magick src/assets/icon/favicon.png -resize %size%x%size% src/assets/icon/apple-icon-%size%x%size%.png

set size=180
echo apple-icon-%size%x%size%.png...
magick src/assets/icon/favicon.png -resize %size%x%size% src/assets/icon/apple-icon-%size%x%size%.png
