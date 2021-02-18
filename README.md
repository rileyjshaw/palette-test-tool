
# Palette test tool

_Bikeshedding (noun): Futile investment of time and energy in discussion of marginal technical issues. Procrastination._

The light theme of my website uses [subtractive primary colors CMY](https://rileyjshaw.com/blog/your-art-teacher-lied), and in a few places they blend together to form secondary colors (RGB) and off-black. Inversely, the dark theme uses additive primary colors RGB, which blend together into CMY and off-white.

Since I dynamically blend primary colors together in some prominent places (eg. the page header), I decided to generate my site’s entire color palette by combining three primaries. That way, whether “blue” is assigned directly (eg. links) or produced by mixing cyan and magenta, it’s the same blue.

I want all the blended colors to look good… ish. Most importantly, the off-black and off-white colors are the main foreground colors; text, borders, etc. So they need to be high contrast, desaturated, and hopefully pretty.

All the above constraints are at odds; to get pretty colors, I would hand-pick them. To ensure the best contrast between each color, I wouldn’t link their perceived brightnesses by blending them. But blending is common enough on my site that I want consistent colors. And I can do better than the default `red: #f00`, `yellow: #ff0`, etc.

So I made this tool! It helps me tweak each primary color and see how the result propagates through blending.

I really doubt this will be useful to anyone. It’s a bespoke developer tool for myself, very purpose-built with messy code.

## Get started
```
git clone git@github.com:rileyjshaw/palette-test-tool
cd palette-test-tool
yarn install
yarn start
```

## Where is the rest of the documentation?

Sorry, I haven’t written any!
