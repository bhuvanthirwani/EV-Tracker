import React, {useRef} from "react";
import {
	CHART_CONFIG,
	DEFAULT_CHART_OPTIONS,
	DEFAULT_DATASET_CONFIG,
	DEFAULT_LINE_CONFIG,
	DEFAULT_TITLE_OPTIONS,
} from './chart.config';
import 'chart.js/auto';
import {Chart} from 'react-chartjs-2';
import {ChartOptions, TitleOptions} from "chart.js";
import 'chartjs-adapter-moment';

const ChartsComponent = (props: any) => {
	const config: CHART_CONFIG = props.chartConfig;
	const id = props.id;
	const chartRef = useRef(null);
	/**
	 * takes the title as string from passed config
	 * @returns Object of type TitleOptions from chart library
	 */
	const setTitle = (): TitleOptions => ({
		...DEFAULT_TITLE_OPTIONS,
		text: config.title
	})

	const setOptions = (): ChartOptions => (
		{
			...DEFAULT_CHART_OPTIONS,
			aspectRatio: config?.aspectRatio || DEFAULT_CHART_OPTIONS.aspectRatio,
			scales: {
				...DEFAULT_CHART_OPTIONS.scales,
				x: {
					...DEFAULT_CHART_OPTIONS.scales?.x,
					...config.scaleOptions?.x,
					title: {
						// @ts-ignore
						...DEFAULT_CHART_OPTIONS.scales?.x?.['title'],
						display: true,
						text: `${config?.meta?.legend?.x} ${config.meta?.unit?.x ? `(${config.meta.unit.x})` : ''}`,
					}
				},
				y: {
					...DEFAULT_CHART_OPTIONS.scales?.x,
					...config.scaleOptions?.y,
					title: {
						// @ts-ignore
						...DEFAULT_CHART_OPTIONS.scales?.y?.['title'],
						display: true,
						text: `${config?.meta?.legend?.y} ${config.meta?.unit?.y ? `(${config.meta.unit.y})` : ''}`,
					}
				}
			},
			plugins: {
				...DEFAULT_CHART_OPTIONS.plugins,
				title: setTitle()
			},
		}
	)

	const setData = () => config.data;

	let datasetConfig: any = DEFAULT_DATASET_CONFIG;

	if (config.type.toLowerCase() === 'line') {
		datasetConfig = {...datasetConfig, ...DEFAULT_LINE_CONFIG};
	}

	const chartData = {
		labels: config?.labels,
		datasets:
			[
				{
					...datasetConfig,
					data: setData(),
				}
			]
	}

	return (
		<Chart
			ref={chartRef}
			id={id}
			data={chartData}
			options={setOptions()}
			type={config.type}
		/>
	);

}

export default ChartsComponent;
