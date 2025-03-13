import { ReactNode } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { ToastMessage } from "wini-web-components";
import { hashPassword, regexGetVariableByThis, RenderComponentByType, validateForm } from "./config";
import { ComponentType, FEDataType } from "../da";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { randomGID, Util } from "../../controller/utils";
import { TableController } from "../../controller/setting";
import { BaseDA, ConfigData } from "../../controller/config";
import { DataController, SettingDataController } from "../../controller/data";
import { RangeForm, Select1Form, SelectMultipleForm } from "../component-form";

interface Props {
    className?: string,
    style?: CSSProperties,
    data?: { [p: string]: any },
    disabled?: boolean,
    readonly?: boolean,
    customFieldUI?: { [p: string]: (methods: UseFormReturn) => ReactNode },
    customOptions?: { [p: string]: Array<{ [k: string]: any }> },
    onSubmit?: (ev: { [p: string]: any }) => void
}

interface FormByTypeProps extends Props {
    formItem: { [p: string]: any }
}

function FormByType(props: FormByTypeProps) {
    const methodOptions = useForm({ shouldFocusError: false, shouldUnregister: false })
    const methods = useForm<any>({ shouldFocusError: false, defaultValues: { Id: randomGID() }, shouldUnregister: false })
    const [cols, setCols] = useState<Array<any>>([])
    const [rels, setRels] = useState<Array<any>>([])
    const watchRel = useMemo<Array<any>>(() => rels.filter(e => e.Query && e.Query.match(regexGetVariableByThis)?.length), [rels.length])
    const staticRel = useMemo<Array<any>>(() => rels.filter(e => !e.Query?.length || !e.Query.match(regexGetVariableByThis)?.length), [rels.length])
    const _colController = new TableController("column")
    const _relController = new TableController("rel")
    const successBtnRef = useRef<any>(null)
    const resetBtnRef = useRef<any>(null)
    const navigate = useNavigate()
    const location = useLocation()
    const params = new URLSearchParams(location.search);
    const { t } = useTranslation()

    const _onSubmit = async (ev: { [k: string]: any }) => {
        let dataItem = { ...ev }
        delete dataItem.id
        switch (props.formItem.Category) {
            case 1:
                for (const key in dataItem) {
                    if (key === "Id") continue;
                    if (dataItem[key] !== undefined && dataItem[key] !== null) {
                        let _col = rels.find(e => e.Column === key) ?? cols.find(e => e.Name === key.replace('_min', "").replace('_max', ""));
                        if (typeof dataItem[key] !== "string" || dataItem[key].length || _col) {
                            if (_col) {
                                switch (_col?.DataType) {
                                    case FEDataType.NUMBER:
                                        const convertValue = typeof dataItem[key] === 'string' ? dataItem[key].length ? parseFloat(dataItem[key].replaceAll(',', '')) : undefined : dataItem[key]
                                        if (convertValue) {
                                            params.set(key, convertValue.toString())
                                            dataItem[key] = convertValue
                                        } else {
                                            params.delete(key)
                                            delete dataItem[key]
                                        }
                                        break;
                                    case FEDataType.DATE:
                                    case FEDataType.DATETIME:
                                        params.set(key, dataItem[key].getTime().toString())
                                        dataItem[key] = dataItem[key].getTime()
                                        break;
                                    case FEDataType.MONEY:
                                        const convertMoney = (typeof dataItem[key] === 'string' && dataItem[key].replaceAll(',', '').length) ? parseInt(dataItem[key].replaceAll(',', '')) : undefined
                                        if (convertMoney) {
                                            params.set(key, convertMoney.toString())
                                            dataItem[key] = convertMoney
                                        } else {
                                            params.delete(key)
                                            delete dataItem[key]
                                        }
                                        break;
                                    case FEDataType.BOOLEAN:
                                        if ([true, 1, "true"].includes(dataItem[_col.Name])) params.set(key, "true")
                                        else params.delete(key)
                                        dataItem[key] = [true, 1, "true"].includes(dataItem[_col.Name]) ? true : false
                                        break;
                                    default:
                                        if (_col.Column && Array.isArray(dataItem[_col.Column])) {
                                            params.set(key, dataItem[key].join(","))
                                            dataItem[key] = dataItem[key].join(",")
                                        } else {
                                            params.set(key, dataItem[key])
                                        }
                                        break;
                                }
                            } else params.set(key, dataItem[key])
                        } else {
                            params.delete(key)
                            delete dataItem[key]
                        }
                    } else if (params.has(key)) {
                        params.delete(key)
                        delete dataItem[key]
                    }
                }
                delete dataItem.Id
                // 
                if (props.onSubmit) props.onSubmit(dataItem)
                else navigate('?' + params.toString())
                // 
                if (successBtnRef.current) successBtnRef.current.click()
                break;
            default:
                dataItem.DateCreated ??= Date.now()
                let validateDataForm: { [k: string]: any } = {}
                Object.keys(dataItem).forEach((key) => {
                    if (typeof dataItem[key] === "string") validateDataForm[key] = dataItem[key].trim()
                })
                const _val = await validateForm({
                    list: cols.filter(e => e.Form.Validate?.length).map(e => {
                        return {
                            Name: e.Name,
                            Validate: e.Form.Validate
                        }
                    }) as any,
                    formdata: validateDataForm
                })
                // Cập nhật lỗi vào React Hook Form
                if (_val && Object.keys(_val).length > 0) {
                    Object.keys(_val).forEach((field: any) => {
                        methods.setError(field, { message: _val[field].join(', ') });
                    });
                    return;
                }
                // Nếu có lỗi, dừng lại không thực hiện submit
                for (let _col of cols) {
                    if (_col.Name === "DateCreated") {
                        dataItem[_col.Name] ??= Date.now()
                    } else if (dataItem[_col.Name] != undefined) {
                        if (!_col.Query) {
                            switch (_col.DataType) {
                                case FEDataType.GID:
                                    break;
                                case FEDataType.STRING:
                                    if (Array.isArray(dataItem[_col.Name])) {
                                        dataItem[_col.Name] = dataItem[_col.Name].join(",")
                                    } else if (typeof dataItem[_col.Name] !== 'string') {
                                        dataItem[_col.Name] = `${dataItem[_col.Name]}`
                                    }
                                    break;
                                case FEDataType.BOOLEAN:
                                    dataItem[_col.Name] = [true, 1, "true"].includes(dataItem[_col.Name]) ? true : false
                                    break;
                                case FEDataType.NUMBER:
                                    dataItem[_col.Name] = typeof dataItem[_col.Name] === 'string' ? parseFloat(dataItem[_col.Name]) : dataItem[_col.Name]
                                    break;
                                case FEDataType.DATE:
                                case FEDataType.DATETIME:
                                    dataItem[_col.Name] = dataItem[_col.Name].getTime()
                                    break;
                                case FEDataType.MONEY:
                                    if (dataItem[_col.Name].replaceAll(',', '').length)
                                        dataItem[_col.Name] = parseInt(dataItem[_col.Name].replaceAll(',', ''))
                                    else delete dataItem[_col.Name]
                                    break;
                                case FEDataType.PASSWORD:
                                    dataItem[_col.Name] = await hashPassword(dataItem[_col.Name])
                                    break;
                                case FEDataType.FILE:
                                    if (ev[_col.Name] && Array.isArray(ev[_col.Name])) {
                                        const uploadFiles = ev[_col.Name].filter((e: any) => e instanceof File)
                                        if (uploadFiles.length) {
                                            const res = await BaseDA.uploadFiles(uploadFiles)
                                            if (res?.length) dataItem[_col.Name] = ev[_col.Name].map((e: any) => e instanceof File ? res.find((f: any) => f.Name === e.name)?.Id : e.Id).filter((id: string) => id?.length).join(",")
                                        } else {
                                            dataItem[_col.Name] = ev[_col.Name].map((e: any) => e.Id).join(",")
                                        }
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
                for (let _rel of rels) {
                    if (dataItem[_rel.Column] && Array.isArray(dataItem[_rel.Column]))
                        dataItem[_rel.Column] = dataItem[_rel.Column].join(",")
                }
                if (props.onSubmit) {
                    props.onSubmit(dataItem)
                } else {
                    const dataController = new DataController(props.formItem.TbName)
                    const res = await dataController.add([dataItem])
                    if (res.code !== 200) return ToastMessage.errors(res.message)
                }
                if (successBtnRef.current) successBtnRef.current.click()
                break;
        }
    }

    // const _onError = (ev: any) => { }

    useEffect(() => {
        if (props.formItem) {
            _relController.getListSimple({ page: 1, size: 100, query: `@TableFK:{${props.formItem.TbName}} @Column:{${Object.keys(props.formItem.Props).filter(p => (props.formItem.Props as any)[p] >= 0).join(" | ")}}` }).then(res => {
                if (res.code === 200) setRels(res.data.map((e: any) => {
                    let _tmp = { ...e, Form: e.Form ? typeof e.Form === "string" ? JSON.parse(e.Form) : { ...e.Form } : { Required: true } }
                    _tmp.Form.Sort = (props.formItem.Props as any)[e.Column]
                    _tmp.Form.Disabled = props.disabled
                    return _tmp
                }))
            })
            _colController.getListSimple({ page: 1, size: 100, query: `@TableName:{${props.formItem.TbName}} @Name:{${Object.keys(props.formItem.Props).filter(p => (props.formItem.Props as any)[p] >= 0).join(" | ")}}` }).then(res => {
                if (res.code === 200) {
                    setCols(res.data.map((e: any) => {
                        let _tmp = { ...e, Form: e.Form ? typeof e.Form === "string" ? JSON.parse(e.Form) : { ...e.Form } : { Required: true } }
                        _tmp.Form.Sort = (props.formItem.Props as any)[e.Name]
                        _tmp.Form.Disabled = props.disabled
                        if (props.readonly && _tmp.Form.ComponentType === ComponentType.select1) _tmp.Form.ReadOnly = props.readonly
                        return _tmp
                    }))
                }
            })
        }
    }, [props.formItem])

    useEffect(() => {
        if (staticRel.length) getOptions({ relatives: staticRel })
    }, [staticRel.length])

    const getOptions = ({ relatives = [], isWatch = false }: { relatives?: Array<{ [p: string]: any }>, page?: number, isWatch?: boolean }) => {
        relatives.forEach((_rel) => {
            let tmpOptions = undefined
            if (props.customOptions) {
                tmpOptions = props.customOptions[`${_rel.Column}`]
            }
            if (tmpOptions) methodOptions.setValue(`${_rel.Column}_Options`, tmpOptions)
            else {
                const _dataPKController = new DataController(_rel.TablePK)
                if (_rel.TablePK === props.formItem.TbName) {
                    _dataPKController.filterByEmptyKey({
                        page: 1, size: 500, searchRaw: _rel.Query?.length ? isWatch ? _rel.Query.replace(regexGetVariableByThis, (m: string) => methods.getValues((regexGetVariableByThis.exec(m) ?? [])[1])) : _rel.Query : "*", key: `ParentId`
                    }).then(async (res) => {
                        if (res.code === 200) methodOptions.setValue(`${_rel.Column}_Options`, res.data ?? [])
                    })
                } else {
                    _dataPKController.getListSimple({
                        page: 1, size: 1000, query: isWatch ? _rel.Query?.replace(regexGetVariableByThis, (m: string) => methods.getValues((regexGetVariableByThis.exec(m) ?? [])[1])) : _rel.Query, returns: ["Id", "Name", "ParentId"]
                    }).then((res) => {
                        if (res.code === 200) methodOptions.setValue(`${_rel.Column}_Options`, res.data ?? [])
                    })
                }
            }
        })
    }

    useEffect(() => {
        if (cols.length) {
            methods.reset()
            if (props.formItem.Category === 1) {
                const mapData = (key: string, value: any) => {
                    if (value === undefined || value === null) return
                    let _col = rels.find(e => e.Column === key)
                    _col ??= cols.find(e => e.Name === key.replace('_min', "").replace('_max', ""))
                    if (_col) {
                        switch (_col.DataType) {
                            case FEDataType.NUMBER:
                                methods.setValue(key, typeof value === 'string' ? parseFloat(value) : value)
                                break;
                            case FEDataType.DATE:
                            case FEDataType.DATETIME:
                                methods.setValue(key, new Date(typeof value === 'string' ? parseInt(value) : value))
                                break;
                            case FEDataType.MONEY:
                                methods.setValue(key, Util.money(value))
                                break;
                            case FEDataType.BOOLEAN:
                                if (_col.Form.ComponentType === ComponentType.radio) methods.setValue(key, `${value}`)
                                else methods.setValue(key, value === "true")
                                break;
                            default:
                                methods.setValue(key, _col.Form.ComponentType === ComponentType.selectMultiple ? value.split(",") : value)
                                break;
                        }
                    } else methods.setValue(key, value)
                }
                if (props.data) {
                    for (const key in props.data) mapData(key, props.data[key])
                }
                for (const [key, value] of params) mapData(key, value)
            } else if (props.data) {
                const dataItem = props.data
                const _fileIds: Array<any> = []
                Object.keys(dataItem).forEach(prop => {
                    const _col = cols.find(e => e.Name === prop)
                    const _rel = rels.find(e => e.Column === prop)
                    if (_col) {
                        switch (_col.DataType) {
                            case FEDataType.GID:
                                methods.setValue(prop, dataItem[prop])
                                break;
                            case FEDataType.STRING:
                                if (_col.Form.Options?.length) {
                                    methods.setValue(prop, (dataItem[prop] ?? "").split(","))
                                } else {
                                    methods.setValue(prop, dataItem[prop])
                                }
                                break;
                            case FEDataType.HTML:
                                methods.setValue(prop, dataItem[prop])
                                break;
                            case FEDataType.BOOLEAN:
                                methods.setValue(prop, dataItem[prop])
                                if (_col.Form.ComponentType === ComponentType.radio) methods.setValue(prop, `${dataItem[prop]}`)
                                break;
                            case FEDataType.NUMBER:
                                methods.setValue(prop, typeof dataItem[prop] === 'string' ? parseFloat(dataItem[prop]) : dataItem[prop])
                                break;
                            case FEDataType.DATE:
                            case FEDataType.DATETIME:
                                methods.setValue(prop, new Date(typeof dataItem[prop] === 'string' ? parseInt(dataItem[prop]) : dataItem[prop]))
                                break;
                            case FEDataType.MONEY:
                                methods.setValue(prop, Util.money(dataItem[prop]))
                                break;
                            case FEDataType.PASSWORD:
                                methods.setValue(prop, dataItem[prop])
                                break;
                            case FEDataType.FILE:
                                if (dataItem[prop]) _fileIds.push({ id: dataItem[prop], name: prop, multiple: _col.Form.Multiple })
                                break;
                            default:
                                break;
                        }
                    } else if (_rel) {
                        const _tmpParse = dataItem[prop]?.length ? dataItem[prop].split(",") : []
                        methods.setValue(prop, _rel.Form.ComponentType === ComponentType.selectMultiple ? _tmpParse : _tmpParse[0])
                    } else {
                        methods.setValue(prop, dataItem[prop])
                    }
                })
                if (_fileIds.length) {
                    BaseDA.getFilesInfor(_fileIds.map(e => e.id.split(",")).flat(Infinity)).then(res => {
                        if (res.code === 200) _fileIds.forEach(e => {
                            const _file = res.data.filter((_file: any) => _file !== undefined && _file !== null && e.id.includes(_file.Id))
                            if (_file.length) methods.setValue(e.name, _file.map((f: any) => ({ ...f, name: f.Name, size: f.Size, type: f.Type, url: ConfigData.imgUrlId + f.Id })))
                        })
                    })
                }
            } else {
                cols.filter((e) => e.DefaultValue != undefined).forEach((_col) => {
                    switch (_col.DataType) {
                        case FEDataType.GID:
                            methods.setValue(_col.Name, _col.Form.DefaultValue)
                            break;
                        case FEDataType.STRING:
                            if (_col.Form.Options?.length) {
                                methods.setValue(_col.Name, _col.Form.DefaultValue.split(","))
                            } else {
                                methods.setValue(_col.Name, _col.Form.DefaultValue)
                            }
                            break;
                        case FEDataType.HTML:
                            methods.setValue(_col.Name, _col.Form.DefaultValue)
                            break;
                        case FEDataType.BOOLEAN:
                            methods.setValue(_col.Name, _col.Form.DefaultValue)
                            break;
                        case FEDataType.NUMBER:
                            methods.setValue(_col.Name, typeof _col.Form.DefaultValue === 'string' ? parseFloat(_col.Form.DefaultValue) : _col.Form.DefaultValue)
                            break;
                        case FEDataType.DATE:
                        case FEDataType.DATETIME:
                            methods.setValue(_col.Name, new Date(typeof _col.DefaultValue === 'string' ? parseInt(_col.DefaultValue) : _col.DefaultValue))
                            break;
                        case FEDataType.MONEY:
                            methods.setValue(_col.Name, Util.money(_col.Form.DefaultValue))
                            break;
                        case FEDataType.PASSWORD:
                            methods.setValue(_col.Name, _col.Form.DefaultValue)
                            break;
                        default:
                            break;
                    }
                })
            }
        }
    }, [props.data, cols.length, params.toString()])
    const rangeComponent = [FEDataType.DATE, FEDataType.DATETIME, FEDataType.NUMBER, FEDataType.MONEY]

    return <form className={`col ${props.className ?? ""}`} style={props.style}>
        {watchRel.length ? <GetWatchRelValues
            methods={methods}
            watchRel={watchRel}
            getOptions={() => {
                getOptions({
                    relatives: watchRel,
                    isWatch: true
                })
            }}
        /> : null}
        <button hidden type="button" className="submit-form" onClick={methods.handleSubmit(_onSubmit)} />
        <button ref={successBtnRef} hidden type="button" className="success-form" />
        {props.formItem.Category === 1 && <button ref={resetBtnRef} hidden type="button" className="reset-form" onClick={() => {
            [...cols, ...rels].forEach(c => {
                if (rangeComponent.includes(c.DataType) && !c.Form?.Options?.length) {
                    methods.setValue(`${c.Name}_min`, null)
                    methods.setValue(`${c.Name}_max`, null)
                }
                methods.setValue(c.Column ?? c.Name, null)
            })
        }} />}
        {(() => {
            switch (props.formItem.Category) {
                case 1:
                    return cols.map((_col) => {
                        if (props.customFieldUI?.[_col.Name]) return props.customFieldUI?.[_col.Name](methods)
                        if ([FEDataType.DATE, FEDataType.DATETIME, FEDataType.NUMBER, FEDataType.MONEY].includes(_col.DataType) && !_col.Form?.Options?.length) {
                            return <RangeForm
                                methods={methods}
                                key={_col.Id}
                                type={_col.DataType === FEDataType.DATE ? 'daterange' : _col.DataType === FEDataType.DATETIME ? 'datetimerange' : _col.DataType === FEDataType.MONEY ? 'money' : 'number'}
                                name={`${_col.Name}_min`}
                                endName={`${_col.Name}_max`}
                                className={props.formItem.Type === "left-label col" ? "row" : undefined}
                                label={_col.Name === "DateCreated" ? (_col.Form.Label ?? t("DateCreated")) : _col.Form.Label}
                                style={{ order: _col.Form.Sort }}
                            />
                        } else {
                            return <RenderComponentByType
                                key={_col.Id}
                                methods={methods}
                                fieldItem={{ ..._col, Form: { ..._col.Form, Required: false } }}
                                label={undefined}
                                style={{ order: _col.Form.Sort }}
                                className={props.formItem.Type === "left-label col" ? "row" : undefined}
                            />
                        }
                    })
                default:
                    return cols.filter(e => e.Name !== "Id" && e.Name !== "DateCreated").map((_col: any) => {
                        if (props.customFieldUI?.[_col.Name]) return props.customFieldUI?.[_col.Name](methods)
                        return <RenderComponentByType
                            key={_col.Id}
                            methods={methods}
                            fieldItem={_col}
                            label={undefined}
                            style={{ order: _col.Form.Sort }}
                            className={props.formItem.Type === "left-label col" ? "row" : undefined}
                            labelStyle={props.formItem.Type === "left-label col" ? { width: "16rem" } : undefined}
                        />
                    })
            }
        })()}
        {rels.map((_rel: any) => {
            if (props.customFieldUI?.[_rel.Column]) return props.customFieldUI?.[_rel.Column](methods)
            const _options = methodOptions.watch(`${_rel.Column}_Options`) ?? []
            let _mapOptions = _options.map((e: any) => { return { id: e.Id, name: e.Name, parentId: e.ParentId } })
            switch (_rel.Form?.ComponentType) {
                case ComponentType.selectMultiple:
                    return <SelectMultipleForm
                        key={_rel.Id}
                        methods={methods}
                        required={props.formItem.Category === 1 ? false : _rel.Form.Required}
                        name={_rel.Column}
                        label={_rel.Form.Label ?? _rel.Column}
                        placeholder={_rel.Form.Placeholder}
                        style={{ order: _rel.Form.Sort }}
                        className={props.formItem.Type === "left-label col" ? "row" : undefined}
                        options={_mapOptions}
                        disabled={_rel.Form.Disabled}
                    />
                default:
                    return <Select1Form
                        key={_rel.Id}
                        required={props.formItem.Category === 1 ? false : _rel.Form.Required}
                        methods={methods}
                        name={_rel.Column}
                        label={_rel.Form.Label ?? _rel.Column}
                        placeholder={_rel.Form.Placeholder}
                        style={{ order: _rel.Form.Sort }}
                        className={props.formItem.Type === "left-label col" ? "row" : undefined}
                        options={_mapOptions}
                        disabled={_rel.Form.Disabled}
                    />
            }
        })}
    </form>
}

const GetWatchRelValues = (props: { methods: UseFormReturn, watchRel: Array<{ [p: string]: any }>, getOptions: any }) => {

    useEffect(() => {
        props.getOptions()
    }, props.watchRel.map(e => {
        const tmp = e.Query?.match(regexGetVariableByThis)![0]
        return props.methods.watch(tmp!.replace(regexGetVariableByThis, (_: any, k: string) => k));
    }))

    return <></>
}

interface FormByIdProps extends Props {
    id: string
}

export const FormById = (props: FormByIdProps) => {
    const [formItem, setFormItem] = useState<{ [p: string]: any }>()

    useEffect(() => {
        if (props.id) {
            const _settingDataController = new SettingDataController("form")
            _settingDataController.getByIds([props.id]).then(async (res) => {
                if (res.code === 200) {
                    let _formItem = res.data[0]
                    if (typeof _formItem.Props === "string") _formItem.Props = JSON.parse(_formItem.Props)
                    setFormItem(_formItem)
                }
            })
        } else if (formItem) setFormItem(undefined)
    }, [props.id])

    return formItem ? <FormByType
        key={formItem.Id}
        formItem={formItem}
        {...props}
    /> : null
}