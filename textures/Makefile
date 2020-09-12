PNGS := $(wildcard *.png)
WEBPS := $(PNGS:%.png=%.webp)

all: $(WEBPS)

%.webp: %.png
	@echo "$< → $@"
	@cwebp -short -z 9 $< -o $@
