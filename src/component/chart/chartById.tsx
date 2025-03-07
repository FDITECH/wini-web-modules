import { CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { DataController, SettingDataController } from "../../controller/data"
import { i18n as i18component, Popup, Select1, Text } from 'wini-web-components'
import styles from './chart.module.css'
import RenderChartByType from "./chartByType"

interface Props {
    id: string,
    searchRaw?: string,
    className?: string,
    /**
     * style of chart block
     * */
    style?: CSSProperties,
    /**
     * style of chart
     * */
    chartStyle?: CSSProperties,
    filterAll?: boolean,
    handleChartClick?: (e: any) => void,
    /**
     * hide heading & filter
     * */
    chartOnly?: boolean,
    /**
     * content between heading & chart
     * */
    content?: ReactNode,
    /**
     * format value of chart
     * */
    formatter?: (ev: any) => void
}

export const ChartById = ({ id, searchRaw = "", className, style = {}, chartStyle = {}, filterAll = false, handleChartClick, formatter }: Props) => {
    const now = new Date()
    const [result, setResult] = useState([])
    const [chartItem, setChartItem] = useState<{ [p: string]: any }>()
    const listTime = useMemo(() => {
        if (!chartItem) return []
        switch (chartItem?.Type) {
            case "line":
            case "bar":
            case "horizontal bar":
                return [
                    { id: "thisWeek", name: i18component.t('thisWeek') },
                    { id: "lastWeek", name: i18component.t('lastWeek') },
                    { id: "thisMonth", name: i18component.t('thisMonth') },
                    { id: "lastMonth", name: i18component.t('lastMonth') },
                    { id: "lastThreeMonth", name: i18component.t('lastThreeMonth') },
                    { id: "lastSixMonth", name: i18component.t('lastSixMonth') },
                    { id: "thisYear", name: i18component.t('thisYear') },
                ]
            default:
                return [7, 30, 45, 60, 90, ...(filterAll ? [Infinity] : [])].map((e, i) => ({ id: e, name: i === 5 ? i18component.t("all") : i18component.t("lastNumberOfDay", { day: e }) }))
        }
    }, [chartItem?.Type])
    const [selectedTime, setSelectedTime] = useState<string | number>()
    const groupByRegex = /(GROUPBY\s+\d+\s+(?:@\w+\s*)+)/g;
    const popupRef = useRef<any>(null)

    const getData = async () => {
        let querySearch = chartItem!.Query.trim() === "*" ? "" : chartItem!.Query
        if (searchRaw.length) querySearch += ` ${searchRaw}`
        switch (selectedTime) {
            case "thisWeek":
                var startDate: number | undefined = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() ? now.getDay() : 7) + 1).getTime()
                var endDate: number | undefined = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() ? now.getDay() : 7) + 7, 23, 59, 59, 999).getTime()
                var reducers = chartItem!.Group.replace(groupByRegex, (m: string, _: any) => {
                    const splitV = m.split(" ")
                    return `APPLY "dayofweek(@DateCreated / 1000)" AS _dayofweek ${splitV[0].trim()} ${parseInt(splitV[1]) + 1} ${["@_dayofweek", ...splitV.slice(2)].join(" ")}`
                })
                break;
            case "lastWeek":
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() ? now.getDay() : 7) - 6).getTime()
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() ? now.getDay() : 7), 23, 59, 59, 999).getTime()
                reducers = chartItem!.Group.replace(groupByRegex, (m: string, _: any) => {
                    const splitV = m.split(" ")
                    return `APPLY "dayofweek(@DateCreated / 1000)" AS _dayofweek ${splitV[0].trim()} ${parseInt(splitV[1]) + 1} ${["@_dayofweek", ...splitV.slice(2)].join(" ")}`
                })
                break;
            case "thisMonth":
                startDate = new Date(now.getFullYear(), now.getMonth()).getTime()
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime()
                reducers = chartItem!.Group.replace(groupByRegex, (m: string, _: any) => {
                    const splitV = m.split(" ")
                    return `APPLY "floor(dayofmonth(@DateCreated / 1000) / 7)" AS _dayofmonth ${splitV[0].trim()} ${parseInt(splitV[1]) + 1} ${["@_dayofmonth", ...splitV.slice(2)].join(" ")}`
                })
                break;
            case "lastMonth":
                startDate = new Date(now.getFullYear(), now.getMonth() - 1).getTime()
                endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).getTime()
                reducers = chartItem!.Group.replace(groupByRegex, (m: string, _: any) => {
                    const splitV = m.split(" ")
                    return `APPLY "floor(dayofmonth(@DateCreated / 1000) / 7)" AS _dayofmonth ${splitV[0].trim()} ${parseInt(splitV[1]) + 1} ${["@_dayofmonth", ...splitV.slice(2)].join(" ")}`
                })
                break;
            case "lastThreeMonth":
                startDate = new Date(now.getFullYear(), now.getMonth() - 3).getTime()
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime()
                reducers = chartItem!.Group.replace(groupByRegex, (m: string, _: any) => {
                    const splitV = m.split(" ")
                    return `APPLY "monthofyear(@DateCreated / 1000)" AS _monthofyear ${splitV[0].trim()} ${parseInt(splitV[1]) + 1} ${["@_monthofyear", ...splitV.slice(2)].join(" ")}`
                })
                break;
            case "lastSixMonth":
                startDate = new Date(now.getFullYear(), now.getMonth() - 6).getTime()
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime()
                reducers = chartItem!.Group.replace(groupByRegex, (m: string, _: any) => {
                    const splitV = m.split(" ")
                    return `APPLY "monthofyear(@DateCreated / 1000)" AS _monthofyear ${splitV[0].trim()} ${parseInt(splitV[1]) + 1} ${["@_monthofyear", ...splitV.slice(2)].join(" ")}`
                })
                break;
            default:
                if (selectedTime === Infinity) startDate = undefined
                else startDate = new Date(now.getFullYear(), now.getMonth(), now.getDay() - (selectedTime as number)).getTime()
                reducers = chartItem!.Group
                break;
        }
        querySearch += ` ${startDate ? `@DateCreated:[${startDate} ${endDate ?? Date.now()}]` : ""}`
        querySearch = querySearch.trim()
        const controller = new DataController(chartItem!.TbName)
        const res = await controller.group({
            searchRaw: querySearch.length ? querySearch : "*",
            reducers: reducers
        })
        if (res.code === 200) setResult(res.data)
    }

    const getMonthName = (m: number) => {
        switch (m) {
            case 0:
                return i18component.t('january')
            case 1:
                return i18component.t('february')
            case 2:
                return i18component.t('march')
            case 3:
                return i18component.t('april')
            case 4:
                return i18component.t('may')
            case 5:
                return i18component.t('june')
            case 6:
                return i18component.t('july')
            case 7:
                return i18component.t('august')
            case 8:
                return i18component.t('september')
            case 9:
                return i18component.t('october')
            case 10:
                return i18component.t('november')
            case 11:
                return i18component.t('december')
            default:
                return ''
        }
    }

    const getxAxisName = () => {
        switch (selectedTime) {
            case "thisWeek":
            case "lastWeek":
                return [i18component.t("mo"), i18component.t("tu"), i18component.t("we"), i18component.t("th"), i18component.t("fr"), i18component.t("sa"), i18component.t("su")];
            case "thisMonth":
            case "lastMonth":
                return ["1 - 7", "8 - 14", "15 - 21", `22 - ${i18component.t("last").toLowerCase()}`];
            case "lastThreeMonth":
                return [new Date(now.getFullYear(), now.getMonth() - 2).getMonth(), new Date(now.getFullYear(), now.getMonth() - 1).getMonth(), now.getMonth()].map(num => getMonthName(num));
            case "lastSixMonth":
                return [new Date(now.getFullYear(), now.getMonth() - 5).getMonth(), new Date(now.getFullYear(), now.getMonth() - 4).getMonth(), new Date(now.getFullYear(), now.getMonth() - 3).getMonth(), new Date(now.getFullYear(), now.getMonth() - 2).getMonth(), new Date(now.getFullYear(), now.getMonth() - 1).getMonth(), now.getMonth()].map(num => getMonthName(num));
            case "thisYear":
                return Array.from({ length: 12 }).map((_, index) => index + 1);
            default:
                return []
        }
    }

    useEffect(() => {
        if (listTime.length) setSelectedTime(listTime[0].id)
    }, [listTime])

    useEffect(() => {
        if (selectedTime) getData()
    }, [selectedTime])

    useEffect(() => {
        if (id) {
            const controller = new SettingDataController("chart")
            controller.getByIds([id]).then(async (res) => {
                if (res.code === 200) {
                    const tmp = res.data[0]
                    tmp.Setting = JSON.parse(tmp.Setting)
                    setChartItem(tmp)
                }
            })
        }
    }, [id])

    return <div className={`col ${styles["chart-block"]} ${className ?? ""}`} style={style}>
        <Popup ref={popupRef} />
        <div className='row' style={{ gap: "1.6rem" }}>
            <div className="col" style={{ flex: 1, gap: "0.4rem" }}>
                <Text className='heading-7'>{chartItem?.Name}</Text>
                {!!chartItem?.Description?.length && <Text className='subtitle-3' style={{ flex: 1 }}>{chartItem?.Description}</Text>}
            </div>
            <Select1
                readOnly
                value={selectedTime}
                options={listTime} style={{ height: "3.2rem", width: "12.8rem", padding: "0 0.8rem" }}
                onChange={(v: any) => { setSelectedTime(v.id) }}
            />
        </div>
        {chartItem && <RenderChartByType
            handleChartClick={handleChartClick}
            formatter={formatter}
            style={chartStyle ?? { height: "15rem", gap: "2.4rem" }}
            type={chartItem.Type}
            xAxisName={(typeof listTime[0] === "number" ? undefined : getxAxisName()) as any}
            datasets={chartItem.Setting.datasets.map((e: any) => {
                try {
                    const data = result
                    switch (selectedTime) {
                        case "thisWeek":
                        case "lastWeek":
                            var listData = [1, 2, 3, 4, 5, 6, 0]
                            var filterByTime = (ev: any, num: number) => parseInt(ev._dayofweek) === num
                            break;
                        case "thisMonth":
                        case "lastMonth":
                            listData = [0, 1, 2, 3]
                            filterByTime = (ev, num) => num === 3 ? parseInt(ev._dayofmonth) >= num : parseInt(ev._dayofmonth) === num
                            break;
                        case "lastThreeMonth":
                            listData = [new Date(now.getFullYear(), now.getMonth() - 2).getMonth(), new Date(now.getFullYear(), now.getMonth() - 1).getMonth(), now.getMonth()]
                            filterByTime = (ev, num) => parseInt(ev._monthofyear) === num
                            break;
                        case "lastSixMonth":
                            listData = [new Date(now.getFullYear(), now.getMonth() - 5).getMonth(), new Date(now.getFullYear(), now.getMonth() - 4).getMonth(), new Date(now.getFullYear(), now.getMonth() - 3).getMonth(), new Date(now.getFullYear(), now.getMonth() - 2).getMonth(), new Date(now.getFullYear(), now.getMonth() - 1).getMonth(), now.getMonth()]
                            filterByTime = (ev, num) => parseInt(ev._monthofyear) === num
                            break;
                        case "thisYear":
                            break;
                        default:
                            break;
                    }
                    var evalValue = eval(e.value)
                } catch (error) {
                    evalValue = 0
                }
                return {
                    ...e,
                    value: evalValue
                }
            })}
            unit={chartItem.Setting.unit}
            legend={chartItem.Setting.legend}
        />}
    </div>
}