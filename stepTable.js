function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function filterData(data, rules){
  return data.filter(y=>{
    for (rule in rules){
      let broken = false
      let oprs = Object.keys(rules[rule]);
      console.log(oprs)
      if (oprs.includes("in")){
        console.log(y[rule])
        broken = broken || (rules[rule]["in"].indexOf(y[rule]) >= 0)
      }
      if ((!broken) || oprs.includes("match")){
        console.log(y[rule])
        broken = broken || y[rule] != rules[rule]["match"]
      }
      if ((!broken) || oprs.includes("regex")){
        console.log(y[rule])
        let re = new RegExp(rules[rule]["regex"])
        broken = broken || !re.test(y[rule])
      }
      if ((!broken) | |oprs.includes("less")){
        console.log(y[rule])
        broken = broken || y[rule] >= rules[rule]["less"]
      }
      if ((!broken) || oprs.includes("greater")){
        console.log(y[rule])
        broken = broken || y[rule] <= rules[rule]["greater"]
      }
      if (broken){
        return false
      }

    }
    // all rules met
    return true
  })
}

function makeTable(data, fields){
  return "<table></table>"
}


class stepTable{
  constructor(url, filters, div, options){
    this.url = url
    this.filters = filters
    this.options = options
    this.urlparam = options.urlparam || "filter"
    this.state = JSON.parse(encodeURIComponent(getParameterByName(urlparam))) || {}
    if (typeof div == "string"){
      div = document.getElementById(div)
    }
    this.div = div
  }
  // in case we want to generalize later
  async _get_data(url){
    return await fetch(url)
  }
  // render the data to the dest
  _render(display_data){
    return display_data
  }
  // clear the dest
  _clear(){
    this.div.innerHTML = ""
  }
  // to get the next filter
}
