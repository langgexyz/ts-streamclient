
export interface StmError extends Error {
	isConnErr: boolean
	isTimeoutErr: boolean
}

export class ConnTimeoutErr implements StmError {
	message: string
	name: string = "ConnTimeoutErr"
	isConnErr: boolean = true
	isTimeoutErr: boolean = true

	constructor(m: string) {
		this.message = m
	}
}

export class ElseConnErr implements StmError {
	message: string
	name: string = "ElseConnErr"
	isConnErr: boolean = true
	isTimeoutErr: boolean = false

	constructor(m: string) {
		this.message = m
	}
}

export class ElseTimeoutErr implements StmError {
	message: string
	name: string = "ElseTimeoutErr"
	isConnErr: boolean = false
	isTimeoutErr: boolean = true

	constructor(m: string) {
		this.message = m
	}
}

export class ElseErr implements StmError {
	message: string
	name: string = "ElseErr"
	cause: Error|null
	isConnErr: boolean = false
	isTimeoutErr: boolean = false

	constructor(m: string, cause: Error|null = null) {
		if (cause == null) {
			this.message = m
		} else {
			this.message = `${m}, caused by ${cause.message}`
		}

		this.cause = cause
	}
}

