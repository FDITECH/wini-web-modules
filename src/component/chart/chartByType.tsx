import { CSSProperties, useRef } from "react";
import ReactEcharts from "echarts-for-react";
import { Text, Winicon } from "wini-web-components";

export interface DatasetItem {
    id: string | number,
    name: string,
    title?: string,
    color?: string,
    value: number | Array<number>
}

interface Props {
    style?: CSSProperties,
    className?: string,
    legend?: "left" | "top" | "right" | "bottom",
    type: 'line' | 'bar' | 'horizontal bar' | 'scatter' | 'bubble' | 'radar' | 'area' | 'doughnut' | 'pie',
    datasets: Array<DatasetItem>,
    xAxisName?: Array<string>,
    yAxisName?: Array<string>,
    unit?: string,
    formatter?: (ev: any) => void
    handleChartClick?: (ev: any) => void
}

export default function RenderChartByType(props: Props) {
    const chartRef = useRef(null);
    let option: any;
    switch (props.type) {
        case 'line':
            option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                yAxis: {
                    type: 'value',
                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                            color: "#D7D7DB"
                        }
                    },
                    name: props.unit,
                    nameLocation: 'end',
                    nameGap: 20,
                    nameTextStyle: {
                        color: '#61616B',
                        fontSize: 12,
                        lineHeight: 16,
                        align: "right",
                    },
                    axisLabel: {
                        formatter: props.formatter,
                        color: '#61616B',
                        fontSize: 12,
                        lineHeight: 16
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: props.xAxisName,
                    axisLine: {
                        lineStyle: {
                            color: '#D7D7DB',
                            width: 1,
                        }
                    },
                    axisLabel: {
                        color: '#61616B',
                        fontSize: 12,
                        lineHeight: 16
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                series: props.datasets.map((c) => {
                    return {
                        stack: 'Total',
                        name: c.title ?? c.name,
                        type: props.type,
                        data: c.value,
                        itemStyle: { color: c.color },
                    }
                }),
            };
            break;
        case 'bar':
            option = {
                tooltip: {
                    trigger: 'item',
                    axisPointer: {
                        type: 'shadow'
                    },
                },
                yAxis: {
                    type: 'value',
                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                            color: "#D7D7DB"
                        }
                    },
                    name: props.unit,
                    nameLocation: 'end',
                    nameGap: 20,
                    nameTextStyle: {
                        color: '#61616B',
                        fontSize: 12,
                        lineHeight: 16,
                        align: "right",
                    },
                    axisLabel: {
                        formatter: props.formatter,
                        color: '#61616B',
                        fontSize: 12,
                        lineHeight: 16
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: true,
                    data: props.xAxisName,
                    axisLine: {
                        lineStyle: {
                            color: '#D7D7DB',
                            width: 1,
                        }
                    },
                    axisLabel: {
                        color: '#61616B',
                        fontSize: 12,
                        lineHeight: 16,
                        interval: 0, // Show all labels
                    }
                },
                grid: {
                    left: '0%',
                    right: '3%',
                    bottom: '0%',
                    containLabel: true
                },
                series: props.datasets?.map((c) => {
                    return {
                        data: c.value,
                        type: props.type,
                        itemStyle: { color: c.color, borderRadius: [2, 2, 0, 0] },
                        radius: '50%',
                        barMinWidth: 8,
                        barMaxWidth: 80,
                        barGap: 0.2,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        },
                    }
                }),
            };
            break;
        case 'horizontal bar':
            option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                xAxis: {
                    type: 'value',
                    axisLine: {
                        lineStyle: {
                            type: 'dotted'
                        }
                    },
                    axisLabel: {
                        formatter: props.formatter,
                    }
                },
                yAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: props.yAxisName
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                series: props.datasets?.map((c) => {
                    return {
                        data: c.value,
                        type: 'bar',
                        itemStyle: { color: c.color, borderRadius: [2, 2, 0, 0] },
                        radius: '50%',
                        barMinWidth: 8,
                        // barWidth: 8,
                        barMaxWidth: 80,
                        barGap: 0.2,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        },
                    }
                }),
            };
            break;
        case 'scatter':
            break;
        case 'pie':
            option = {
                title: {
                    text: props.datasets.map(e => typeof e.value === 'number' ? e.value : e.value.reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0),
                    left: 'center',
                    top: 'center',
                    textStyle: {
                        fontSize: "2.4rem",
                        fontWeight: 'bold',
                        color: '#18181B',
                        fontFamily: "Inter"
                    },
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)', // Shows only value and percentage
                },
                series: [
                    {
                        type: props.type,
                        radius: '50%',
                        padAngle: 1,
                        label: {
                            show: false,
                            position: 'center',
                        },
                        emphasis: {
                            label: {
                                show: false,
                                fontSize: 14,
                                fontWeight: 'bold',
                            },
                        },
                        // labelLine: {
                        //     show: false,
                        // },
                        data: props.datasets.map(e => {
                            return { value: e.value, itemStyle: { color: e.color, borderRadius: 4 } }
                        })
                    },
                ],
            }
            break;
        case 'doughnut':
            option = {
                title: {
                    text: props.datasets.map(e => typeof e.value === 'number' ? e.value : e.value.reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0),
                    left: 'center',
                    top: 'center',
                    textStyle: {
                        fontSize: "2.4rem",
                        fontWeight: 'bold',
                        color: '#18181B',
                        fontFamily: "Inter"
                    },
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)', // Shows only value and percentage
                },
                series: [
                    {
                        type: "pie",
                        radius: ['56%', '90%'],
                        center: ['50%', '50%'],
                        avoidLabelOverlap: false,
                        padAngle: 1,
                        label: {
                            show: false,
                            position: 'center',
                        },
                        emphasis: {
                            label: {
                                show: false,
                                fontSize: 14,
                                fontWeight: 'bold',
                            },
                        },
                        data: props.datasets.map(e => {
                            return { name: e.title, value: e.value, itemStyle: { color: e.color, borderRadius: 4 } }
                        })
                    },
                ],
            }
            break;
        case 'bubble':
            break;
        case 'radar':
            option = {
                // legend: {
                //     left: 'left',
                //     icon: 'roundRect',
                //     borderRadius: 8,
                // },
                radar: {
                    // shape: 'circle',
                    indicator: props.datasets.map(() => {
                        return {
                            // name: e[0],
                            // max: Math.max(...e.slice(1))
                        }
                    })
                },
                series: props.datasets?.map((c) => {
                    return {
                        type: props.type,
                        itemStyle: { color: c.color, borderRadius: [2, 2, 0, 0] },
                        radius: '50%',
                        barMinWidth: 8,
                        barMaxWidth: 80,
                        barGap: 0.2,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        },
                    }
                }),
            };
            break;
        default:
            break;
    }

    switch (props.legend) {
        case "top":
            return <div className="col" style={props.style}>
                <div className="row" style={{ gap: "1.6rem", flexWrap: "wrap" }}>
                    {props.datasets.map(e => {
                        if (props.type.includes("bar")) {
                            return <div key={e.id} className="row" style={{ gap: "0.8rem" }}>
                                <div style={{ height: "1.6rem", width: "1.6rem", borderRadius: "0.4rem", backgroundColor: e.color }} />
                                <Text className="label-4" style={{ flex: 1 }}>{e.name}</Text>
                            </div>
                        } else if (props.type.includes("line")) {
                            return <div key={e.id} className="row" style={{ gap: "0.8rem" }}>
                                <Winicon src="fill/business/line-chart" size={"2rem"} color={e.color} />
                                <Text className="label-4" style={{ flex: 1 }}>{e.name}: {e.value}</Text>
                            </div>
                        } else {
                            return <div key={e.id} className="row" style={{ gap: "0.8rem" }}>
                                <div style={{ height: 8, width: 8, borderRadius: "50%", backgroundColor: e.color }} />
                                <Text className="label-4" style={{ flex: 1 }}>{e.name}: {e.value}</Text>
                            </div>
                        }
                    })}
                </div>
                <ReactEcharts
                    onEvents={{ click: props.handleChartClick as any }}
                    notMerge={true}
                    lazyUpdate={true}
                    option={option}
                    style={{ ...(["bar", "line"].some(e => props.type.includes(e)) ? { width: "100%" } : { height: "100%" }), aspectRatio: ["bar", "line"].some(e => props.type.includes(e)) ? "5 / 3" : "1 / 1" }}
                />
            </div>
        case "bottom":
            return <div className="col" style={props.style}>
                <ReactEcharts
                    notMerge={true}
                    lazyUpdate={true}
                    option={option}
                    style={{ ...(["bar", "line"].some(e => props.type.includes(e)) ? { width: "100%" } : { height: "100%" }), aspectRatio: ["bar", "line"].some(e => props.type.includes(e)) ? "5 / 3" : "1 / 1" }}
                />
                <div className="row" style={{ gap: "1.6rem", flexWrap: "wrap" }}>
                    {props.datasets.map(e => {
                        if (props.type.includes("bar")) {
                            return <div key={e.id} className="row" style={{ gap: "0.8rem" }}>
                                <div style={{ height: "1.6rem", width: "1.6rem", borderRadius: "0.4rem", backgroundColor: e.color }} />
                                <Text className="label-4" style={{ flex: 1 }}>{e.name}</Text>
                            </div>
                        } else if (props.type.includes("line")) {
                            return <div key={e.id} className="row" style={{ gap: "0.8rem" }}>
                                <Winicon src="fill/business/line-chart" size={"2rem"} color={e.color} />
                                <Text className="label-4" style={{ flex: 1 }}>{e.name}: {e.value}</Text>
                            </div>
                        } else {
                            return <div key={e.id} className="row" style={{ gap: "0.8rem" }}>
                                <div style={{ height: 8, width: 8, borderRadius: "50%", backgroundColor: e.color }} />
                                <Text className="label-4" style={{ flex: 1 }}>{e.name}: {e.value}</Text>
                            </div>
                        }
                    })}
                </div>
            </div>
        case "left":
            return <div className="row" style={props.style}>
                <div className="col" style={{ gap: "1.6rem", flex: 1 }}>
                    {props.datasets.map(e => {
                        if (props.type.includes("bar")) {
                            return <div key={e.id} className="row" style={{ gap: "0.8rem" }}>
                                <div style={{ height: "1.6rem", width: "1.6rem", borderRadius: "0.4rem", backgroundColor: e.color }} />
                                <Text className="label-4" style={{ flex: 1 }}>{e.name}</Text>
                            </div>
                        } else if (props.type.includes("line")) {
                            return <div key={e.id} className="row" style={{ gap: "0.8rem" }}>
                                <Winicon src="fill/business/line-chart" size={"2rem"} color={e.color} />
                                <Text className="label-4" style={{ flex: 1 }}>{e.name}: {e.value}</Text>
                            </div>
                        } else {
                            return <div key={e.id} className="row" style={{ gap: "0.8rem" }}>
                                <div style={{ height: 8, width: 8, borderRadius: "50%", backgroundColor: e.color }} />
                                <Text className="label-4" style={{ flex: 1 }}>{e.name}: {e.value}</Text>
                            </div>
                        }
                    })}
                </div>
                <ReactEcharts
                    notMerge={true}
                    lazyUpdate={true}
                    option={option}
                    style={{ ...(["bar", "line"].some(e => props.type.includes(e)) ? { width: "70%" } : { height: "100%" }), aspectRatio: ["bar", "line"].some(e => props.type.includes(e)) ? "5 / 3" : "1 / 1" }}
                />
            </div>
        case "right":
        default:
            return <div className="row" style={props.style}>
                <ReactEcharts
                    onEvents={{ click: props.handleChartClick as any }}
                    notMerge={true}
                    lazyUpdate={true}
                    option={option}
                    style={{ ...(["bar", "line"].some(e => props.type.includes(e)) ? { width: "70%" } : { height: "100%" }), aspectRatio: ["bar", "line"].some(e => props.type.includes(e)) ? "5 / 3" : "1 / 1" }}
                />
                <div className="col" style={{ gap: "1.6rem", flex: 1, minWidth: "9.8rem" }}>
                    {props.datasets.map(e => {
                        if (props.type.includes("bar")) {
                            return <div key={e.id} className="row" style={{ gap: "0.8rem" }}>
                                <div style={{ height: "1.6rem", width: "1.6rem", borderRadius: "0.4rem", backgroundColor: e.color }} />
                                <Text className="label-4" style={{ flex: 1 }}>{e.name}</Text>
                            </div>
                        } else if (props.type.includes("line")) {
                            return <div key={e.id} className="row" style={{ gap: "0.8rem" }}>
                                <Winicon src="fill/business/line-chart" size={"2rem"} color={e.color} />
                                <Text className="label-4" style={{ flex: 1 }}>{e.name}: {e.value}</Text>
                            </div>
                        } else {
                            return <div key={e.id} className="row" style={{ gap: "0.8rem" }}>
                                <div style={{ height: 8, width: 8, borderRadius: "50%", backgroundColor: e.color }} />
                                <Text className="label-4" style={{ flex: 1 }}>{e.name}: {e.value}</Text>
                            </div>
                        }
                    })}
                </div>
            </div>
    }
}