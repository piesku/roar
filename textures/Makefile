PNGS := $(wildcard *.png)
WEBPS := $(PNGS:%.png=%.webp)

all: $(WEBPS)

%.webp: %.png
	@echo "$< → $@"
	@cwebp -short -lossless -q 100 $< -o $@
