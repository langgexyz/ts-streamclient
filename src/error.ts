
export interface StmErrorBase extends Error {
	isConnErr: boolean
	isTimeoutErr: boolean
	get toConnErr(): StmError
}

export class ConnTimeoutErr implements StmErrorBase {
	message: string
	name: string = "ConnTimeoutErr"
	isConnErr: boolean = true
	isTimeoutErr: boolean = true
	get toConnErr(): StmError {
		return this
	}

	constructor(m: string) {
		this.message = m
	}
}

export class ElseConnErr implements StmErrorBase {
	message: string
	name: string = "ElseConnErr"
	isConnErr: boolean = true
	isTimeoutErr: boolean = false
	get toConnErr(): StmError {
		return this
	}

	constructor(m: string) {
		this.message = m
	}
}

export class ElseTimeoutErr implements StmErrorBase {
	message: string
	name: string = "ElseTimeoutErr"
	isConnErr: boolean = false
	isTimeoutErr: boolean = true
	get toConnErr(): StmError {
		return new ElseConnErr(this.message)
	}

	constructor(m: string) {
		this.message = m
	}
}

export class ElseErr implements StmErrorBase {
	message: string
	name: string = "ElseErr"
	cause: Error|null
	isConnErr: boolean = false
	isTimeoutErr: boolean = false
	get toConnErr(): StmError {
		return new ElseConnErr(this.message)
	}

	constructor(m: string, cause: Error|null = null) {
		if (cause == null) {
			this.message = m
		} else {
			this.message = `${m}, caused by ${cause.message}`
		}

		this.cause = cause
	}
}

export type StmError = ElseErr | ElseTimeoutErr | ElseConnErr | ConnTimeoutErr

