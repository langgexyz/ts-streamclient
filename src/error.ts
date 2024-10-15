
abstract class StmErrorBase extends Error {
	abstract isConnErr: boolean
	abstract isTimeoutErr: boolean
	abstract get toConnErr(): StmError

	toString(): string {
		return this.message
	}
}

export class ConnTimeoutErr extends StmErrorBase {
	message: string
	name: string = "ConnTimeoutErr"
	isConnErr: boolean = true
	isTimeoutErr: boolean = true
	get toConnErr(): StmError {
		return this
	}

	constructor(m: string) {
		super()
		this.message = m
	}
}

export class ElseConnErr extends StmErrorBase {
	message: string
	name: string = "ElseConnErr"
	isConnErr: boolean = true
	isTimeoutErr: boolean = false
	get toConnErr(): StmError {
		return this
	}

	constructor(m: string) {
		super()
		this.message = m
	}
}

export class ElseTimeoutErr extends StmErrorBase {
	message: string
	name: string = "ElseTimeoutErr"
	isConnErr: boolean = false
	isTimeoutErr: boolean = true
	get toConnErr(): StmError {
		return new ElseConnErr(this.message)
	}

	constructor(m: string) {
		super()
		this.message = m
	}
}

export class ElseErr extends StmErrorBase {
	message: string
	name: string = "ElseErr"
	cause: Error|null
	isConnErr: boolean = false
	isTimeoutErr: boolean = false
	get toConnErr(): StmError {
		return new ElseConnErr(this.message)
	}

	constructor(m: string, cause: Error|null = null) {
		super()
		if (cause == null) {
			this.message = m
		} else {
			this.message = `${m}, caused by ${cause.message}`
		}

		this.cause = cause
	}
}

export type StmError = ElseErr | ElseTimeoutErr | ElseConnErr | ConnTimeoutErr

export function isStmError(arg: any): arg is StmError {
	return arg instanceof StmErrorBase
}
