import { GlobalStateType } from "./state"

const reducer = (newState: GlobalStateType, newValue: Partial<GlobalStateType>) => {
	return {...newState, ...newValue}
}

export default reducer