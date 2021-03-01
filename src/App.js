import './App.css';
import React, {useState, useRef, useEffect, useMemo} from 'react';
import {
	multiply,
	darken,
	screen,
	lighten, // RGB frontrunner.
	exclusion,
	difference,
} from 'color-blend';
import {COLORS} from './constants';
import tinycolor from 'tinycolor2';

const mixMethods = {
	CMY: [
		{name: 'darken', method: darken},
		{name: 'multiply', method: multiply},
	],
	RGB: [
		{name: 'lighten', method: lighten},
		{name: 'screen', method: screen},
		{name: 'exclusion', method: exclusion},
		{name: 'difference', method: difference},
	],
};

function getShoulders(primary) {
	return {
		C: ['G', 'B'],
		M: ['B', 'R'],
		Y: ['R', 'G'],
		R: ['M', 'Y'],
		G: ['Y', 'C'],
		B: ['C', 'M'],
	}[primary];
}

function getNewSecondaryColors(primary1, palette, mixMethod) {
	const [secondaryColors, fullMixColor] = {
		C: [
			[
				['M', 'B'],
				['Y', 'G'],
			],
			[['M', 'Y'], 'K'],
		],
		M: [
			[
				['C', 'B'],
				['Y', 'R'],
			],
			[['C', 'Y'], 'K'],
		],
		Y: [
			[
				['C', 'G'],
				['M', 'R'],
			],
			[['C', 'M'], 'K'],
		],
		R: [
			[
				['G', 'Y'],
				['B', 'M'],
			],
			[['G', 'B'], 'W'],
		],
		G: [
			[
				['R', 'Y'],
				['B', 'C'],
			],
			[['R', 'B'], 'W'],
		],
		B: [
			[
				['R', 'M'],
				['G', 'C'],
			],
			[['R', 'G'], 'W'],
		],
	}[primary1];
	const primary1Rgb = tinycolor(toHslString(palette[primary1])).toRgb();
	return [
		...secondaryColors.map(([primary2, secondary]) => {
			const primary2HslString = toHslString(palette[primary2]);
			const primary2Rgb = tinycolor(primary2HslString).toRgb();
			const newValue = toHslArray(tinycolor(mixMethod(primary1Rgb, primary2Rgb)).toHsl());
			return [secondary, newValue];
		}),
		[
			fullMixColor[1],
			toHslArray(
				tinycolor(
					fullMixColor[0].reduce(
						(acc, primary) => mixMethod(acc, tinycolor(toHslString(palette[primary])).toRgb()),
						primary1Rgb
					)
				).toHsl()
			),
		],
	];
}
const toHslString = ([h, s, l]) => `hsl(${h},${s}%,${l}%)`;
const toHslArray = ({h, s, l}) => [h, s * 100, l * 100];
const toggle = x => !x;

const defaultPalettes = {
	CMY: COLORS.light,
	RGB: COLORS.dark,
};
const colorOrder = 'RYGCBM'.split('');
const fgColors = {CMY: 'K', RGB: 'W'};
const colorSpaces = ['CMY', 'RGB']; // colorSpaces[+darkMode] === 'RGB'

function App() {
	const [darkMode, setDarkMode] = useState(false);
	const [palettes, setPalettes] = useState(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const colorString = urlParams.get('colors');
		if (!colorString) return defaultPalettes;
		const triplets = colorString.split(';').map(triplet => triplet.split(','));
		if (triplets.length !== 14 || !triplets.every(triplet => triplet.length === 3)) return defaultPalettes;
		const acc = {};
		colorSpaces.forEach((colorSpace, i) => {
			acc[colorSpace] = {};

			const offset = 7 * i;
			colorOrder.forEach((color, j) => {
				acc[colorSpace][color] = triplets[j + offset];
			});
			acc[colorSpace][fgColors[colorSpace]] = triplets[6 + offset];
		});
		return acc;
	});
	const [activeColor, setActiveColor] = useState(null);
	const [mixMethodIndices, setMixMethodIndices] = useState({CMY: 0, RGB: 0});
	const [showSecondaryColors, setShowSecondaryColors] = useState(true);
	const colors = useMemo(
		() => (showSecondaryColors ? colorOrder : colorOrder.filter((_, i) => !(i % 2) === darkMode)),
		[showSecondaryColors, darkMode]
	);
	const colorsQueryString = useMemo(
		() =>
			`?colors=${colorSpaces
				.flatMap(colorSpace =>
					[...colorOrder, fgColors[colorSpace]].map(color => palettes[colorSpace][color].join())
				)
				.join(';')}`,
		[palettes]
	);

	const hueRef = useRef(null);
	const colorSpace = colorSpaces[+darkMode];
	const mixMethod = useMemo(() => mixMethods[colorSpace][mixMethodIndices[colorSpace]], [
		colorSpace,
		mixMethodIndices,
	]);
	const palette = palettes[colorSpace];

	useEffect(() => {
		setPalettes(oldPalettes => {
			const newPalettes = {...oldPalettes};
			const newPalette = {...newPalettes[colorSpace]};
			const secondaryColors = [0, 1, 2].flatMap(i =>
				getNewSecondaryColors(colorSpace[i], newPalette, mixMethod.method)
			);
			secondaryColors.forEach(([key, value]) => {
				newPalette[key] = value;
			});
			newPalettes[colorSpace] = newPalette;
			return newPalettes;
		});
	}, [colorSpace, mixMethod]);

	return (
		<div
			className={`palette-test-tool${darkMode ? ' dark' : ''}`}
			style={{color: toHslString(palette[darkMode ? 'W' : 'K'])}}
		>
			<header>
				<h1 className="title">Palette test tool</h1>
				<div className="subtitle">
					<button
						tabIndex="-1"
						onClick={() => {
							setShowSecondaryColors(toggle);
						}}
					>
						{showSecondaryColors ? 'Hide' : 'Show'} secondary colors
					</button>
					<div />
					<button
						tabIndex="-1"
						onClick={() => {
							setMixMethodIndices(indices => {
								const newIndex = (indices[colorSpace] + 1) % mixMethods[colorSpace].length;
								return {
									...indices,
									[colorSpace]: newIndex,
								};
							});
						}}
					>
						Mix mode: {mixMethod.name}
					</button>
					<div />
					<button
						tabIndex="-1"
						onClick={() => {
							setActiveColor(null);
							setDarkMode(toggle);
						}}
					>
						Dark mode: {darkMode ? 'on' : 'off'}
					</button>
					<div />
					<button
						tabIndex="-1"
						onClick={() => {
							window.history.replaceState(null, null, colorsQueryString);
							console.log(
								JSON.stringify(
									colorSpaces.reduce((outerAcc, colorSpace) => {
										outerAcc[colorSpace] = Object.entries(palettes[colorSpace]).reduce(
											(acc, [color, values]) => {
												const {r, g, b} = tinycolor(toHslString(values)).toRgb();
												acc[color] = [r, g, b];
												return acc;
											},
											{}
										);
										return outerAcc;
									}, {}),
									null,
									'\t'
								).replace(/"([^"]+)":/g, '$1:')
							);
							alert('Check the console for RGB triplets.');
						}}
					>
						Export
					</button>
					<div />
					<a href={`https://rileyjshaw.com${colorsQueryString}`} target="_blank" rel="noreferrer">
						rileyjshaw.com
					</a>
				</div>
			</header>
			<main>
				<div className="controls">
					{activeColor ? (
						<>
							{palette[activeColor].map((value, i) => (
								<input
									key={i}
									type="range"
									value={value}
									max={i ? 100 : 360}
									ref={i ? null : hueRef}
									onChange={e => {
										setPalettes(oldPalettes => {
											const newPalettes = {...oldPalettes};
											const newPalette = {...newPalettes[colorSpace]};
											const newColor = [...newPalette[activeColor]];
											newColor[i] = e.target.value;
											newPalette[activeColor] = newColor;
											const secondaryColors = getNewSecondaryColors(
												activeColor,
												newPalette,
												mixMethod.method
											);
											secondaryColors.forEach(([key, value]) => {
												newPalette[key] = value;
											});
											newPalettes[colorSpace] = newPalette;
											return newPalettes;
										});
									}}
								/>
							))}
						</>
					) : (
						<p className="info">Click a primary color ({colorSpace}) to begin editing.</p>
					)}
				</div>
				<ul className="color-list bw">
					{darkMode ? (
						<li className="color-item" style={{background: toHslString(palette.W)}}>
							<span className="hex">{tinycolor(toHslString(palette.W)).toHexString()}</span>
						</li>
					) : (
						<li className="color-item" style={{background: toHslString(palette.K)}}>
							<span className="hex">{tinycolor(toHslString(palette.K)).toHexString()}</span>
						</li>
					)}
				</ul>
				<ul className="color-list new">
					{colors.map((key, i) => {
						const isPrimary = !(showSecondaryColors && darkMode === !!(i % 2));
						const hslString = toHslString(palette[key]);
						const shoulders = getShoulders(key);
						let leftShoulderHueGap = palette[key][0] - palette[shoulders[0]][0];
						while (leftShoulderHueGap < -180) leftShoulderHueGap += 360;
						let rightShoulderHueGap = palette[shoulders[1]][0] - palette[key][0];
						while (rightShoulderHueGap < -180) rightShoulderHueGap += 360;
						return (
							<li
								key={key}
								className={`color-item${key === activeColor ? ' active' : ''}${
									isPrimary ? ' primary' : ''
								}`}
								style={{background: hslString}}
								onClick={() => {
									if (!isPrimary) return;
									setActiveColor(key);
									setPalettes(oldPalettes => {
										const newPalettes = {...oldPalettes};
										const newPalette = {...newPalettes[colorSpace]};
										const secondaryColors = getNewSecondaryColors(
											key,
											newPalette,
											mixMethod.method
										);
										secondaryColors.forEach(([key, value]) => {
											newPalette[key] = value;
										});
										newPalettes[colorSpace] = newPalette;
										return newPalettes;
									});
									setTimeout(() => hueRef.current && hueRef.current.focus(), 0);
								}}
							>
								<button
									className="label"
									disabled={!isPrimary}
									tabIndex="-1"
									onClick={() => {
										setActiveColor(key);
										setPalettes(oldPalettes => {
											const newPalettes = {...oldPalettes};
											const newPalette = {...newPalettes[colorSpace]};
											newPalette[key] = COLORS.browser[key];
											const secondaryColors = getNewSecondaryColors(
												key,
												newPalette,
												mixMethod.method
											);
											secondaryColors.forEach(([key, value]) => {
												newPalette[key] = value;
											});
											newPalettes[colorSpace] = newPalette;
											return newPalettes;
										});
									}}
								>
									{key}
								</button>
								<span className="hue">
									<span className="shoulder">{Math.round(leftShoulderHueGap)}</span>
									<span className="main-hue">{Math.round(palette[key][0])}</span>
									<span className="shoulder">{Math.round(rightShoulderHueGap)}</span>
								</span>
								<span className="saturation">{Math.round(palette[key][1])}</span>
								<span className="lightness">{Math.round(palette[key][2])}</span>
								<span className="brightness">{tinycolor(hslString).getBrightness()}</span>
								<span className="hex">{tinycolor(hslString).toHexString()}</span>
							</li>
						);
					})}
				</ul>
				<ul className="color-list old">
					{colors.map((key, i) => {
						const isPrimary = !(showSecondaryColors && darkMode === !!(i % 2));
						const hslString = toHslString(COLORS.ideal[key]);
						return (
							<li
								key={key}
								className={`color-item${isPrimary ? ' primary' : ''}`}
								style={{background: hslString}}
							>
								<button
									className="hue-saturation-lightness"
									disabled={!isPrimary}
									tabIndex="-1"
									onClick={() => {
										setActiveColor(key);
										setPalettes(oldPalettes => {
											const newPalettes = {...oldPalettes};
											const newPalette = {...newPalettes[colorSpace]};
											newPalette[key] = COLORS.ideal[key];
											const secondaryColors = getNewSecondaryColors(
												key,
												newPalette,
												mixMethod.method
											);
											secondaryColors.forEach(([key, value]) => {
												newPalette[key] = value;
											});
											newPalettes[colorSpace] = newPalette;
											return newPalettes;
										});
									}}
								>
									{COLORS.ideal[key][0]}, {COLORS.ideal[key][1]}, {COLORS.ideal[key][2]}
								</button>
								<span className="brightness">{tinycolor(hslString).getBrightness()}</span>
								<span className="hex">{tinycolor(hslString).toHexString()}</span>
							</li>
						);
					})}
				</ul>
				<div className="tri-intersection">
					<div
						className="p1"
						style={{background: toHslString(palette[colorSpace[0]]), mixBlendMode: mixMethod.name}}
					/>
					<div
						className="p2"
						style={{background: toHslString(palette[colorSpace[1]]), mixBlendMode: mixMethod.name}}
					/>
					<div
						className="p3"
						style={{background: toHslString(palette[colorSpace[2]]), mixBlendMode: mixMethod.name}}
					/>
				</div>
			</main>
		</div>
	);
}

export default App;
