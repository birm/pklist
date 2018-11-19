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
function make_table(data, headers, linkSrc, linkDst, prefix){
  prefix = prefix || ""
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
          outstr+="<a href='" + prefix + data[i][linkSrc] + "'>"
      }
      outstr += "<tr>"
      for (let j=0; j < headers.length; j++){
          let val = data[i][headers[j]] || "missing"
          // handle cell link if needed
          outstr += "<td>"
          if ((linkDst == headers[j] || linkDst == "_COLUMN") && data[i][linkSrc]){
              outstr+="<a href='" + prefix + data[i][linkSrc] + "'>"
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
    this.data_ready = false
    this.filters = filters
    this.options = options
    this.urlfield = options.urlfield || "url"
    this.urlparam = options.urlparam || "filter"
    this.urlprefix = options.urlprefix || ""
    this.state = JSON.parse(getParameterByName(this.urlparam)) || {}
    if (typeof div == "string"){
      div = document.getElementById(div)
    }
    this.div = div
  }
  // in case we want to generalize later
  load_url(url){
    return fetch(url).then(x=>x.json()).then(x=>{
      this.data = x;
      this.data_ready = true
    })
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
      }
      let data = []
      for (let j = startat; j < element.children.length; j++){
          let res = {}
          let maxval = Math.min(element.children[j].children.length, headers.length)
          for (let i = 0; i < maxval; i++){
              res[headers[i]] = (element.children[j].children[i].textContent)
          }
          data.push(res)
      }
      this.data = data;
      this.data_ready = true
  }
  pick_table(data){
    let htmltable
    data = filterData(data, this.state)
    // which filter is the first unassigned?
    Object.keys(this.state)
    this.filters
    let nextFilter = ""
    for (let i in this.filters){
      if (!this.state.hasOwnProperty(this.filters[i])){
        nextFilter = this.filters[i];
        break;
      }
    }
    if (nextFilter == ""){
      htmltable = make_table(data, Object.keys(data[0]), this.urlfield, "_COLUMN", this.urlprefix)
    } else {
      let filters = []
      let base = window.location.href.split("?")[0]
      let basestate = this.state
      let skipstate = this.state
      skipstate[nextFilter] = {}
      let allurl = base + "?" + this.urlparam + "="+ encodeURIComponent(JSON.stringify(basestate))
      let res = [{filter: "All", url: allurl}]
      for(let i in data){
        let val = data[i][nextFilter]
        basestate[nextFilter] = {'match': val}
        let link = base + "?" + this.urlparam + "="+ encodeURIComponent(JSON.stringify(basestate))
        if (filters.indexOf(val) == -1){
          filters.push(val)
          res.push({filter: val, 'url': link})
        }
      }
      htmltable = make_table(res, ["filter"], 'url', "_COLUMN")
    }
    return htmltable
  }
  // render the data to the dest
  run(){
    this._render(this.pick_table(this.data))
  }
  // clear the dest
  _render(x){
    this.div.innerHTML = x
  }
  // to get the next filter
}
