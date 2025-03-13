import { CSSProperties, useEffect, useMemo, useState } from "react"
import { DataController, SettingDataController } from "../../controller/data"
import { useForm, UseFormReturn } from "react-hook-form"
import { TableController } from "../../controller/setting"
import { ActionType, ComponentType, FEDataType, TriggerType } from "../da"
import { useNavigate } from "react-router-dom"
import { Text, Winicon } from "wini-web-components"
import { BaseDA, ConfigData } from "../../controller/config"
import { regexGetVariableByThis, regexUrlWithVariables } from "./config"
import { Util } from "../../controller/utils"

interface Props {
    dataItem?: { [p: string]: any },
    style?: CSSProperties,
    className?: string,
    controller?: "all" | { page: number, size: number, searchRaw?: string, filter?: string, sortby?: Array<{ prop: string, direction?: "ASC" | "DESC" }>, loadmore?: boolean },
}

interface RanderCardProps extends Props {
    layers: Array<{ [p: string]: any }>,
    cardItem: { [p: string]: any },
}

function RenderCard({ layers = [], cardItem, style, className, dataItem, controller = "all" }: RanderCardProps) {
    const methods = useForm({ shouldFocusError: false })
    const [data, setData] = useState<{ data: Array<{ [p: string]: any }>, totalCount?: number }>({ data: [], totalCount: undefined })
    const [_rels, setRels] = useState<Array<{ [p: string]: any }>>([])
    const [_cols, setCols] = useState<Array<{ [p: string]: any }>>([])

    const mapRelativeData = async () => {
        const _relController = new TableController("rel")
        const _rels = await _relController.getListSimple({ page: 1, size: 100, query: `@TableFK:{${cardItem.TbName}}` })
        if (_rels.code === 200) setRels(_rels.data)
    }

    const mapColumnData = async () => {
        const _colController = new TableController("column")
        const _colRes = await _colController.getListSimple({ page: 1, size: 200, query: `@TableName:{${cardItem.TbName}}` })
        if (_colRes.code !== 200) setCols(_colRes.data)
    }

    useEffect(() => {
        if (cardItem?.TbName) {
            mapRelativeData()
            mapColumnData()
        } else {
            if (_cols.length) setCols([])
            if (_rels.length) setRels([])
        }
    }, [cardItem?.TbName])

    const getData = async () => {
        const dataController = new DataController(cardItem.TbName)
        let tmp;
        if (dataItem) {
            tmp = { data: [dataItem], totalCount: 1 }
        } else if (controller === "all") {
            const res = await dataController.getAll()
            if (res.code === 200) tmp = { data: res.data, totalCount: res.data.length }
        } else {
            const res = await dataController.aggregateList({ page: controller.page, size: controller.size, searchRaw: controller.searchRaw ?? "*", filter: controller.filter, sortby: controller.sortby })
            if (res.code === 200) tmp = { data: res.data, totalCount: res.totalCount }
        }
        if (!tmp) return undefined
        const colFiles = _cols.filter(e => e.DataType === FEDataType.FILE).map(e => e.Name)
        if (colFiles.length) {
            if (typeof controller !== "string" && controller.loadmore) {
                const currentFiles = methods.getValues("_files") ?? []
                const _tmpFileIds = tmp.data.map((e: any) => colFiles.map(c => e[c]?.split(","))).flat(Infinity).filter((id: string) => id?.length && currentFiles.every((f: any) => f.Id !== id) && !id.startsWith("http"))
                BaseDA.getFilesInfor(_tmpFileIds).then(f => {
                    if (f.code === 200) methods.setValue("_files", [...currentFiles, ...f.data.filter((e: any) => !!e)])
                })
            } else {
                const _tmpFileIds = tmp.data.map((e: any) => colFiles.map(c => e[c]?.split(","))).flat(Infinity).filter((id: string) => id?.length && !id.startsWith("http"))
                BaseDA.getFilesInfor(_tmpFileIds).then(f => {
                    if (f.code === 200) methods.setValue("_files", f.data.filter((e: any) => !!e))
                })
            }
        }
    }

    useEffect(() => {
        if (_cols.length) getData()
        else if (data.totalCount) setData({ data: [], totalCount: 0 })
    }, [dataItem, cardItem?.TbName, _cols.length, controller])

    return !!data.totalCount && data.data.map(item => {
        return <RenderCardByLayers key={item.Id} dataItem={item} layers={layers} cols={_cols} className={className} style={style} methods={methods} />
    })
}

const RenderCardByLayers = (props: { layers: Array<{ [p: string]: any }>, parentId?: string, dataItem?: { [p: string]: any }, cols?: Array<{ [p: string]: any }>, className?: string, style?: CSSProperties, methods: UseFormReturn<any> }) => {
    if (props.parentId) {
        return props.layers.filter(e => e.ParentId === props.parentId).map(e => <RenderComponentByLayer key={e.Id} layers={props.layers} item={e} dataItem={props.dataItem} cols={props.cols} methods={props.methods} />)
    } else {
        return props.layers.filter(e => !e.ParentId).map(e => <RenderComponentByLayer key={e.Id} layers={props.layers} item={e} dataItem={props.dataItem} cols={props.cols} className={props.className} style={props.style} methods={props.methods} />)
    }
}

const RenderComponentByLayer = (props: { item: { [p: string]: any }, layers: Array<{ [p: string]: any }>, dataItem?: { [p: string]: any }, cols?: Array<{ [p: string]: any }>, style?: CSSProperties, className?: string, methods: UseFormReturn<any> }) => {
    const navigate = useNavigate()
    const customProps = useMemo(() => {
        let _props = { ...props.item.Setting }
        if (props.style) _props.style = { ..._props.style, ...props.style }
        if (props.className) _props.className = [..._props.className.split(" "), props.className].join(" ")
        if (_props.action && Array.isArray(_props.action)) {
            Object.values(TriggerType).forEach(trigger => {
                const triggerActions = _props.action.filter((e: any) => e.Type === trigger)
                switch (trigger) {
                    case TriggerType.click:
                        const _onClick = async (acts = []) => {
                            for (const [_, act] of acts.entries()) {
                                const actItem = act as { [p: string]: any }
                                switch (actItem.Action) {
                                    case ActionType.navigate:
                                        if (actItem.To) {
                                            if (regexUrlWithVariables.test(actItem.To)) {
                                                const url = actItem.To.replace(regexGetVariableByThis, (m: string) => props.dataItem ? props.dataItem[regexGetVariableByThis.exec(m)![1]] : m)
                                                if (url.includes("https")) window.open(url, "_blank")
                                                else navigate(url)
                                            } if (actItem.To.includes("https")) window.open(actItem.To, "_blank")
                                            else navigate("/" + actItem.To)
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                        if (triggerActions.length) {
                            _props.onClick = () => _onClick(triggerActions)
                            if (_props.style) _props.style = { ..._props.style, cursor: "pointer" }
                            else _props.style = { cursor: "pointer" }
                        }
                        break;
                    default:
                        break;
                }
            })
        }
        return _props
    }, [props.style, props.className, props.dataItem, props.item])
    const dataValue: any = useMemo(() => {
        if (!props.dataItem || !props.cols?.length) return undefined
        const _col = props.cols?.find(e => e.Name === props.item.NameField || e.Column === props.item.NameField)
        if (!_col) return undefined
        if (_col.Column) {

        } else {
            let tmpValue = props.dataItem[props.item.NameField]
            switch (_col.DataType) {
                case FEDataType.FILE:
                    tmpValue = props.methods.watch("_files")?.filter((f: any) => tmpValue.includes(f.Id))
                    break;
                case FEDataType.HTML:
                    tmpValue = { __html: tmpValue }
                    break;
                case FEDataType.MONEY:
                    tmpValue = tmpValue ? Util.money(tmpValue) : undefined
                    break;
                case FEDataType.DATE:
                    tmpValue = tmpValue ? Util.datetoString(new Date(typeof tmpValue === 'string' ? parseInt(tmpValue) : tmpValue)) : undefined
                    break;
                case FEDataType.DATETIME:
                    tmpValue = tmpValue ? Util.datetoString(new Date(typeof tmpValue === 'string' ? parseInt(tmpValue) : tmpValue), "dd/mm/yyyy hh:mm") : undefined
                    break;
                default:
                    if (_col.Form?.Options?.length) {
                        if (_col.Form.ComponentType === ComponentType.select1) {
                            tmpValue = _col.Form.Options.find((e: any) => e.id === tmpValue)?.name ?? tmpValue
                        } else {
                            tmpValue = _col.Form.Options.filter((e: any) => {
                                switch (_col.DataType) {
                                    case FEDataType.BOOLEAN:
                                        return tmpValue === e.id || `${tmpValue}` === `${e.id}`
                                    default:
                                        return tmpValue?.includes(e.id);
                                }
                            }).map((e: any) => e.name).join(",")
                        }
                    }
                    break;
            }
        }
    }, [props.dataItem, props.item, props.cols])

    switch (props.item.Type) {
        case ComponentType.container:
            return <div {...customProps}>
                <RenderCardByLayers layers={props.layers} parentId={props.item.Id} dataItem={props.dataItem} cols={props.cols} methods={props.methods} />
            </div>
        case ComponentType.text:
            if (dataValue && typeof dataValue !== "string" && dataValue?.["__html"]) return <Text {...customProps} html={dataValue["__html"]} />
            else return <Text {...customProps}>{dataValue ?? props.item.Setting?.value ?? ""}</Text>
        case ComponentType.icon:
            return <Winicon {...({ ...customProps, src: dataValue ?? customProps.src })} />
        case ComponentType.img:
            return (dataValue && Array.isArray(dataValue)) ?
                dataValue.map((e: any) => <img key={e.Id} alt="" {...({ ...customProps, src: e.startsWith("http") ? e : (ConfigData.imgUrlId + e) })} />) :
                <img alt="" {...customProps} />
        default:
            return <div {...customProps} />
    }
}

interface CardProps extends Props {
    id: string
}

export const CardById = (props: CardProps) => {
    const [cardItem, setCardItem] = useState<{ [p: string]: any }>()

    useEffect(() => {
        if (props.id) {
            const _settingDataController = new SettingDataController("card")
            _settingDataController.getByIds([props.id]).then(async (res) => {
                if (res.code === 200) {
                    let _cardItem = res.data[0]
                    if (_cardItem.Props && typeof _cardItem.Props === "string") _cardItem.Props = JSON.parse(_cardItem.Props)
                    setCardItem(_cardItem)
                }
            })
        } else if (cardItem) setCardItem(undefined)
    }, [props.id])

    return cardItem ? <RenderCard
        key={cardItem.Id}
        cardItem={cardItem}
        layers={cardItem.Props}
        {...props}
    /> : null
}