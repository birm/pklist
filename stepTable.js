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
        broken = broken || (rules[rule]["in"].indexOf(y[rule]) == -1)
      }
      if ((!broken) && oprs.includes("match")){
        broken = broken || y[rule] != rules[rule]["match"]
      }
      if ((!broken) && oprs.includes("regex")){
        let re = new RegExp(rules[rule]["regex"])
        broken = broken && !re.test(y[rule])
      }
      if ((!broken) || oprs.includes("less")){
        broken = broken && y[rule] >= rules[rule]["less"]
      }
      if ((!broken) || oprs.includes("greater")){
        broken = broken && y[rule] <= rules[rule]["greater"]
      }
      if (broken){
        return false
      }

    }
    // all rules met
    return true
  })
}

// make a basic linked html table from the data
function make_table(data, headers, linkSrc, linkDst){
  outstr = "<table class='steptable'>"
  outstr += "<tr>"
  for (let j=0; j < headers.length; j++){
      outstr += "<th>"
      outstr += headers[j]
      outstr += "</th>"
  }
  outstr += "</tr>"
  for (let i = 0; i < data.length; i++){
      // link the row if needed
      if (linkDst == "_COLUMN" && data[i][linkSrc]){
          outstr+="<a href='" + data[i][linkSrc] + "'>"
      }
      outstr += "<tr>"
      for (let j=0; j < headers.length; j++){
          let val = data[i][headers[j]] || "missing"
          // handle cell link if needed
          outstr += "<td>"
          if ((linkDst == headers[j] || linkDst == "_COLUMN") && data[i][linkSrc]){
              outstr+="<a href='" + data[i][linkSrc] + "'>"
          }
          outstr += val
          // close link if we opened it
          if ((linkDst == headers[j] || linkDst == "_COLUMN") && data[i][linkSrc]){
              outstr+="</a>"
          }
          outstr += "</td>"
      }
      outstr +="</tr>"
  }
  outstr+="</table>"
  return outstr
}


class stepTable{
  constructor(div, filters, options){
    this.filters = filters
    this.options = options
    this.urlfield = options.urlfield || "url"
    this.urlparam = options.urlparam || "filter"
    this.state = JSON.parse(getParameterByName(urlparam)) || {}
    if (typeof div == "string"){
      div = document.getElementById(div)
    }
    this.div = div
  }
  // in case we want to generalize later
  async load_url(url){
    return await fetch(url)
  }
  // load from a table, more specifically an element with children representing records, each with children representing attributes
  // pass an array to headers if the child does not contain headers as its first record
  // note that it can be anything table-like in this regard.
  load_table(element, headers){
      let startat = 0
      if (!headers){
          startat = 1
          headers = []
          let headrow = element.children[0].children
          for (let i = 0; i < headrow.length; i++){
              headers[i] = (headrow[i].textContent)
          }
          console.log(headers)
      }
      data = []
      for (let j = startat; j < element.children.length; j++){
          let res = {}
          let maxval = Math.min(element.children[j].children.length, headers.length)
          for (let i = 0; i < maxval; i++){
              res[headers[i]] = (element.children[j].children[i].textContent)
          }
          data.push(res)
      }
      return data
  }
  // render the data to the dest
  run(data){
    let res = []
    // which filter is the first unassigned?
    Object.keys(this.state)
    this.filters
    nextFilter = ""
    for (i in this.filters){
      if (!this.state.hasOwnProperty(this.filters[i])){
        nextFilter = this.filters[i];
        break;
      }
    }
    if (nextFilter == ""){
      // we can display the data properly
      this.urlfield
    } else {
      // make this filter
      // get possible values for that filter, accounting for active filters
      // make data where list of objects; each has name of element and link to that selected
      let base = window.location.split("?")[0]
      let basestate = this.state
      // FILTER THE DATA
      for(){
        let val = val
        basestate[nextFilter] = {'match': val}
        let link = base + "?" + this.urlparam + encodeURIComponent(basestate)
        res.push({nextFilter: val, 'url': link})
      }

      // render it
    }
    return res
  }
  // clear the dest
  _clear(){
    this.div.innerHTML = ""
  }
  // to get the next filter
}
