module.exports.validateRegisterInputs = (
    username,
    password,
    confirmPassword,
    email
) => {
    const validationResult={}

    username.trim() === '' ? validationResult.username='username invalid' :false
    email.trim() === '' ? validationResult.email='email invalid' :
     !email.match('^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$') ? validationResult.email='email not correct' :false
     password === '' ? validationResult.password='password invalid' :false
      confirmPassword === '' ? validationResult.confirmPassword='confirmPassword invalid' :false
      password !== confirmPassword ? (validationResult.confirmPassword='Password and confirmPassword do not match'):null
    
   
        
    return { valid: Object.keys(validationResult).length<1, validationResult: validationResult } 
}
module.exports.validateLoginInputs = (
    username,
    password
) => {
    const validationResult={}
    username.trim() === '' ? validationResult.username='username invalid':false
        password === '' ? validationResult.password='password invalid':false

        return { valid: Object.keys(validationResult).length<1, validationResult: validationResult } }