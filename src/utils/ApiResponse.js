//this class is for api response 

class ApiResponse  {
    constructor(
        statusCode,data,message="Success"
    ) {
        this.statusCode = statusCode,
        this.data = data,
        this.message = message
    }
}