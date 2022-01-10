export default class FormValidation {
    constructor(form, {
        errorColor = "#dc3545",
        successColor = "#198754",
        bootstrapValidClass = "is-valid",
        bootstrapInvalidClass = "is-invalid",
        bootstrapInvalidFeedBack = "invalid-feedback"
    } = {}) {
        this.forms = Array.from(document.querySelectorAll(form))
        this.errorColor = errorColor
        this.successColor = successColor
        this.bootstrapValidClass = bootstrapValidClass
        this.bootstrapInvalidClass = bootstrapInvalidClass
        this.bootstrapInvalidFeedBack = bootstrapInvalidFeedBack

        // Initialize methods when DOMContent Loads
        this.removeDefaultValidation()
        this.setEmailPattern()
        this.handleSubmitForm()
        this.onBlurChange()
        this.onInputChange()
    }


    /**
     * Add a novalidate attribute to remove default validation behavior
     */
    removeDefaultValidation() {
        for (const novalidation of this.forms) {
            novalidation.setAttribute('novalidate', true)
        }
    }


    /**
     * Validate upon submission ~ For bootstrap (if its used)
     */
    onSubmitForm() {
        this.forms.slice.call(this.forms).forEach(form => {
            form.addEventListener('submit', (event) => {
                event.preventDefault()
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }
                form.classList.add('was-validated')
            }, false)
        })
    }


    /**
     * Check all field upon form submission
     */
    handleSubmitForm() {
        document.addEventListener('submit', this.handleSubmit.bind(this), false)
    }


    /**
     * Validate field and check for validity errors
     * @param {HTMLElement} field 
     * @returns validity error messages
     */
    hasError(field) {
        // Do not validate submits, buttons, file, reset inputs and disabled fields
        switch (field.type) {
            case 'submit':
            case 'button':
            case 'file':
            case 'reset':
            case 'disabled':
                return
        }

        // Get field validity status
        const validity = field.validity

        switch (true) {
            // check if validity is valid.If not, return null
            case validity.valid:
                return

            // check if required field is empty
            case validity.valueMissing:
                return `${field.id ? this.toUpperCase(field.id) : field.placeholder ? field.placeholder : field.name} is required.`

            // check if input type is mismatched
            case validity.typeMismatch:
                if (field.type === "email") {
                    const emailPattern = /^((([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))$/
                    if (emailPattern.test(field.value) === false) {
                        return `Please enter a valid email address`
                    }

                }
                // Todo: Complete this if necessary...
                if (field.type === "url") return `Please enter a URL`

            // check if there is a mis-match in pattern for mostly email
            case validity.patternMismatch:
                if (field.type === "email") {
                    if (field.hasAttribute("pattern")) {
                        return `Domain portion of the email address is invalid (the portion after the @ symbol)`
                    }
                    return `Please match required pattern`
                }

            // check if input is too short
            case validity.tooShort:
                return `Please, value is too short.`

            // check if input is too long
            case validity.tooLong:
                return `Please, value is too long.`

            // check if input Number is not a number
            case validity.badInput:
                return `Please enter a number.`

            default:
                return `Value entered for ${field.id ? field.id : field.name} is invalid`
        }

    }


    /**
     * Show Validity Error message on UI
     * @param {HTMLElement} field 
     * @param {HTMLElement} error 
     * @returns field element with error
     */
    showError(field, error) {
        const labelIsVisible = field.previousElementSibling

        // clear the valid message if it exist
        this.bootstrapValidClass ?
            field.classList.remove(this.bootstrapValidClass) :
            field.classList.remove("success")

        // add error class to field 
        this.bootstrapInvalidClass ?
            field.classList.add(this.bootstrapInvalidClass) :
            field.classList.add("error")

        // if field is radio and part of a group, add error and get last item
        if (field.type === "radio" && field.name) {
            let group = document.getElementsByTagName(field.name)
            if (group.length > 0) {
                for (let i = 0; i < group.length; i++) {
                    if (group[i].form !== field.form) continue
                    this.bootstrapInvalidClass ?
                        group[i].classList.add(this.bootstrapInvalidClass) :
                        group[i].classList.add('error')
                }
                field = group[group.length - 1]
            }
        }

        // get field id or name
        const fieldId = field.id || field.name
        if (!fieldId) return

        // if error message field already exist, return it. If not, create one
        const boostrapErrorMessageField = field.form.querySelector(`div.${this.bootstrapInvalidFeedBack}#error-for-${fieldId}`)
        const customErrorMessageField = field.form.querySelector(`div.error-message#error-for-${fieldId}`)
        let message = boostrapErrorMessageField ?
            boostrapErrorMessageField :
            customErrorMessageField
        if (!message) {
            message = document.createElement("div")
            message.className = this.bootstrapInvalidFeedBack ?
                this.bootstrapInvalidFeedBack : "error-message"
            message.id = `error-for-${fieldId}`
            field.parentNode.insertBefore(message, field.nextSibling);
        }

        // if field is a radio or checkbox, insert error after label or after field
        let label
        if (field.type === "radio" || field.type === "checkbox") {
            label = field.parentNode
            if (label) {
                label.parentNode.insertBefore(message, label.nextSibling)
            } else {
                field.parentNode.insertBefore(message, field.nextSibling)
            }
        }

        // add ARIA role to the field
        field.setAttribute("aria-describedby", `error-for-${fieldId}`)

        // update error message
        message.innerHTML = error

        // show the error message
        message.style.display = "block"
        message.style.visibility = "visible"
        labelIsVisible ? labelIsVisible.style.color = `${this.errorColor}` : null
    }


    /**
     * Remove Error / Remove aria-describedby / hide visible error
     * @param {HTMLElement} field 
     * @returns field element with cleared errors
     */
    clearError(field) {
        const labelIsVisible = field.previousElementSibling

        // clear invalid class to field 
        this.bootstrapInvalidClass ?
            field.classList.remove(this.bootstrapInvalidClass) :
            field.classList.remove("error")

        // add valid class to field
        this.bootstrapValidClass ?
            field.classList.add(this.bootstrapValidClass) :
            field.classList.add("success")


        // remove ARIA role from the field
        field.removeAttribute("aria-describedby")

        // if field is radio and part of a group, remove error and get last item
        if (field.type === "radio" && field.name) {
            let group = document.getElementsByName(field.name)
            if (group.length > 0) {
                for (let i = 0; i < group.length; i++) {
                    // check field in current form
                    if (group[i].form !== field.name) continue
                    this.bootstrapInvalidClass ?
                        group[i].classList.remove(this.bootstrapInvalidClass) :
                        group[i].classList.remove("error")
                }
                field = group[group.length - 1]
            }
        }

        // get field id or name
        const fieldId = field.id || field.name
        if (!fieldId) return

        // if error message field exist. If it does, clear it.
        const boostrapErrorMessageField = field.form.querySelector(`div.${this.bootstrapInvalidFeedBack}#error-for-${fieldId}`)
        const customErrorMessageField = field.form.querySelector(`div.error-message#error-for-${fieldId}`)
        let message = boostrapErrorMessageField ?
            boostrapErrorMessageField :
            customErrorMessageField
        if (!message) return;

        // hide error
        message.innerHTML = ''
        message.style.display = 'none'
        message.style.visibility = 'hidden'
        labelIsVisible ? labelIsVisible.style.color = "" : null
    }


    /**
     * Listen for when user leaves/tabs away from field
     */
    onBlurChange() {
        document.addEventListener('blur', this.handleInterractionChanges.bind(this), true)
    }


    /**
     * Listen for when user invoke an input change
     */
    onInputChange() {
        document.addEventListener("input", this.handleInterractionChanges.bind(this), true)
    }


    /*  ======== UTILITIES (HELPER FUNCTIONS) ======= */


    /**
     * Function that converts first letter to uppercase
     * @param {String} str 
     * @returns string with capitalized first letter
     */
    toUpperCase(str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }


    /**
     * Function that handles form submission
     * @param {EventListener} event 
     * @returns an event function
     */
    handleSubmit(event) {
        event.preventDefault()
        // only run if field is present for validation
        if (!event.target.dataset.validate === "validate") return

        // get all form fields element
        let fields = event.target.elements

        // validate each fields and store first field with error inside a variable to be used later
        let error, hasErrors

        for (let i = 0; i < fields.length; i++) {
            error = this.hasError(fields[i])
            if (error) {
                this.showError(fields[i], error)
                if (!hasErrors) {
                    hasErrors = fields[i]
                }
            }
        }

        if (hasErrors) {
            event.preventDefault()
            hasErrors.focus()
        }
    }


    /**
     * Function that handles validation changes
     * @param {*} event 
     * @returns an event function
     */
    handleInterractionChanges(event) {
        // only run if field is prevent for validation
        if (!event.target.dataset.validate === "validate") return

        // validate the field
        const error = this.hasError(event.target)

        // if there is an error, disply the error
        error ? this.showError(event.target, error) : this.clearError(event.target)

    }


    /**
     * Function that Set domain pattern for email
     * @returns email pattern
     */
    setEmailPattern() {
        const emailField = Array.from(document.querySelectorAll(`input[type=email]`))
        const pattern = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*(\.\w{2,})+$/
        const domainPattern = pattern.toString().slice(1, -1)
        emailField.forEach(field => {
            field.setAttribute("pattern", domainPattern)
        })
        return emailField
    }
}