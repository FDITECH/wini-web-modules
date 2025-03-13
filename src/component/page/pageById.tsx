import { useNavigate } from "react-router-dom"
import { CSSProperties, ReactNode, useEffect, useRef } from "react"
import { ActionType, ComponentType, TriggerType } from "../da"
import { closePopup, Popup, showPopup, Text, Winicon } from "wini-web-components"
import { FormById } from "../form/formById"
import { CardById } from "../card/cardById"
import { ChartById } from "../chart/chartById"

interface Props {
    childrenData?: { [p: string]: ReactNode },
    styleData?: { [p: string]: CSSProperties },
    itemData?: { [p: string]: ReactNode }
}

interface RenderPageProps extends Props {
    layers: Array<{ [p: string]: any }>,
    layout: Array<{ [p: string]: any }>,
}

const RenderPageView = ({ childrenData, styleData, itemData, layers = [], layout = [] }: RenderPageProps) => {
    const navigate = useNavigate()

    const renderPageView = (item: { [p: string]: any }, list: Array<{ [p: string]: any }> = []) => {
        if (itemData?.[item.Id]) return itemData[item.Id]
        const children = list.filter(e => e.ParentId === item.Id)
        let _props = { ...item.Setting }
        _props.style ??= {}
        if (styleData && styleData[item.Id]) _props.style = { ..._props.style, ...styleData[item.Id] }
        if (_props.action?.length && Array.isArray(_props.action)) {
            Object.values(TriggerType).forEach(trigger => {
                const triggerActions = _props.action.filter((e: any) => e.Type === trigger)
                switch (trigger) {
                    case TriggerType.click:
                        const _onClick = async (acts = []) => {
                            for (const [i, act] of acts.entries()) {
                                const actItem = act as { [p: string]: any }
                                switch (actItem.Action) {
                                    case ActionType.navigate:
                                        if (actItem.To) {
                                            if (actItem.To.includes("https")) window.open(actItem.To, "_blank")
                                            else navigate("/" + actItem.To)
                                        }
                                        break;
                                    case ActionType.submit:
                                        const formElement = document.getElementById(actItem.To)
                                        const submitBtn = formElement?.querySelector(`:scope > button.submit-form`) as any
                                        const successBtn = formElement?.querySelector(`:scope > button.success-form`) as any
                                        if (submitBtn) {
                                            if (successBtn && triggerActions.slice(i + 1).length) successBtn.onclick = () => _onClick(triggerActions.slice(i + 1))
                                            submitBtn.click()
                                        }
                                        return;
                                    case ActionType.showPopup:
                                        const popupElement = document.getElementById(actItem.To)
                                        const openPopupBtn = popupElement?.querySelector(`:scope > button.open`) as any
                                        if (openPopupBtn) openPopupBtn.click()
                                        return;
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
        delete _props.action
        switch (item.Type) {
            case ComponentType.container:
                if (_props) _props['component-type'] = item.Type
                if (childrenData) var childComponent = childrenData[item.Id]
                return <div key={item.Id} {..._props}>
                    {
                        childComponent ?? (item.Setting?.className?.includes("layout-body") ?
                            layers.filter(e => !e.ParentId).map(e => renderPageView(e, layers)) :
                            children.map(e => renderPageView(e, list)))
                    }
                </div>
            case ComponentType.text:
                return <Text key={item.Id} {..._props}>{item.Setting?.value ?? ""}</Text>
            case ComponentType.img:
                return <img key={item.Id} alt="" draggable={false} {..._props} />
            case ComponentType.chart:
                return <ChartById key={item.Id} {..._props} />
            case ComponentType.form:
                _props.id = item.Id
                return <FormById key={item.Id} {..._props} />
            case ComponentType.card:
                return <CardById key={item.Id} {..._props} />
            case ComponentType.icon:
                return <Winicon key={item.Id} {..._props} />
            case ComponentType.popup:
                _props.id = item.Id
                return <ActionPopup key={item.Id} {..._props} >
                    {
                        item.Setting?.className?.includes("layout-body") ?
                            layers.filter(e => !e.ParentId).map(e => renderPageView(e, layers)) :
                            children.map(e => renderPageView(e, list))
                    }
                </ActionPopup>
            default:
                return <div key={item.Id} {..._props} />
        }
    }

    return layout.filter(e => !e.ParentId).map(e => renderPageView(e, layout))
}

const ActionPopup = ({ id, children, className = "" }: { id: string, children: ReactNode, className?: string }) => {
    const ref = useRef<any>(null)

    useEffect(() => {
        if (ref.current) ref.current.setState({ ...ref.current.state, content: children })
    }, [children])

    return <div id={id} className={"action-popup-container " + className}>
        <Popup ref={ref} />
        <button hidden type="button" className="open" onClick={() => {
            showPopup({
                ref: ref,
                content: children ?? <div />
            })
        }} />
        <button hidden type="button" className="close" onClick={() => { closePopup(ref) }} />
    </div>
}

interface PageByIdProps extends Props {
    id: string
}

export const PageById = (props: PageByIdProps) => { }

interface PageByUrlProps extends Props {
    url: string
}

export const PageByUrl = (props: PageByUrlProps) => { }