// @ts-ignore
import Chart, {ChartData, ChartDataset, ChartType, TickOptions} from 'chart.js/auto';
import {ChartOptions, TitleOptions} from 'chart.js';

const CHART_CONSTANTS = {
	backgroundColor: '#00d8a8',
	fontFamily: 'Archia',
	titleColor: '#09213d',
}


export interface CHART_CONFIG {
	title: string;
	type: ChartType;
	data: ChartData;
	xAxis?: any;
	yAxis?: any;
	labels?: Array<any>;
	aspectRatio?: number,
	scaleOptions?: any,
	meta?: any
}

export const DEFAULT_TITLE_OPTIONS: TitleOptions = {
	text: '',
	padding: 8,
	align: 'start',
	color: CHART_CONSTANTS.titleColor,
	display: false,
	font: {
		family: CHART_CONSTANTS.fontFamily,
		size: 16,
		lineHeight: 2,
		style: 'normal',
		weight: 'normal',
	},
	position: 'top',
	fullSize: true
}

const DEFAULT_TICKS: Partial<TickOptions> = {
	color: CHART_CONSTANTS.titleColor,
	font: {
		family: CHART_CONSTANTS.fontFamily,
		size: 10,
		weight: 'bold',
		lineHeight: 1,
		style: 'inherit'
	}
}

export const DEFAULT_CHART_OPTIONS: ChartOptions = {
	aspectRatio: 2.5,
	maintainAspectRatio: true,
	backgroundColor: 'transparent',
	hover: {
		intersect: false,
		mode: 'nearest',
		axis: 'xy',
	},
	layout: {
		padding: 4
	},
	interaction: {
		intersect: true,
		axis: 'xy',
		mode: 'point'
	},
	responsive: true,
	plugins: {
		title: undefined,
		legend: {
			display: false
		}
	},
	scales: {
		x: {
			ticks: {...DEFAULT_TICKS, maxRotation: 0},
			grid: {
				display: false,
				// drawBorder: false
			},
			title: {
				display: false,
				text: undefined,
				padding: 0
			}
		},
		y: {
			ticks: {...DEFAULT_TICKS},
			grid: {
				display: false,
				// drawBorder: false
			},
			title: {
				display: false,
				text: undefined,
				padding: 0
			}
		}
	}
}

export const DEFAULT_DATASET_CONFIG: ChartDataset = {
	data: [],
	backgroundColor: CHART_CONSTANTS.backgroundColor,
	barPercentage: 1.0,
	categoryPercentage: 1.0,
	borderWidth: 1,
}

export const DEFAULT_LINE_CONFIG: Partial<ChartDataset> = {
	borderWidth: 2,
	fill: true,
	tension: 0.5,
	cubicInterpolationMode: 'monotone',
	borderColor: CHART_CONSTANTS.backgroundColor,
	backgroundColor: 'rgb(72, 216, 168,0.1)',
	pointRadius: 0,
	pointHoverBackgroundColor: CHART_CONSTANTS.backgroundColor
}
