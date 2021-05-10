module.exports = {
    changeDate: (x)=>{
        let date =(""+x.getDate()).length<2?"0"+x.getDate():x.getDate();
        let month = (""+(1+x.getMonth())).length<2?"0"+(1+x.getMonth()):1+x.getMonth();
        let year =x.getFullYear();
        return date+"."+month+"."+year;
    }
  }