import { WiniProvider } from "./component/WiniProvider";
import { randomGID, Util, formatNumberConvert, inputMoneyPattern } from "./controller/utils";
import { DataController } from "./controller/data";
import { CardById } from "./component/card/cardById";
import { ChartById } from "./component/chart/chartById";
import { FormById } from "./component/form/formById";
import { PageById, PageByUrl } from "./component/page/pageById";
import { TextFieldForm, InputPasswordForm, TextAreaForm, DateTimePickerForm, CKEditorForm, Select1Form, SelectMultipleForm, SwitchForm, RateForm, CheckboxForm, RadioButtonForm, GroupRadioButtonForm, ImportFileForm, RangeForm, GroupCheckboxForm, ColorPickerForm } from './component/component-form';

export {
    randomGID,
    Util,
    formatNumberConvert,
    inputMoneyPattern,
    DataController,
    CardById,
    ChartById,
    FormById,
    PageById,
    PageByUrl,
    TextFieldForm,
    InputPasswordForm,
    TextAreaForm,
    DateTimePickerForm,
    CKEditorForm,
    Select1Form,
    SelectMultipleForm,
    SwitchForm,
    RateForm,
    CheckboxForm,
    RadioButtonForm,
    GroupRadioButtonForm,
    ImportFileForm,
    RangeForm,
    GroupCheckboxForm,
    ColorPickerForm
}

export default WiniProvider