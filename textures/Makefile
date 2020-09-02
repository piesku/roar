PNGS := $(wildcard *.png)
WEBPS := $(PNGS:%.png=%.webp)

all: $(WEBPS)

%.webp: %.png
	@echo "$< → $@"
	@cwebp -quiet -lossless -q 100 $< -o $@
