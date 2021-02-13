export const COLORS = Object.entries({
	main: {
		white: [40, 23, 97],
		black: [80, 16, 4],
		red: [3, 100, 61],
		green: [127, 63, 49],
		blue: [208, 100, 43],
		cyan: [187, 100, 42],
		magenta: [340, 82, 52],
		yellow: [52, 100, 50],
	},
	lighter: {

	},
	darker: {

	},
});

export const COLOR_STRINGS = COLORS.reduce((acc1, [variant, _o]) => {
	acc1[variant] = Object.entries(_o).reduce((acc2, [color, values]) => {
		acc2[color] = `hsl(${values[0]},${values[1]}%,${values[2]}%)`;
		return acc2;
	}, {});
	return acc1;
}, {});
