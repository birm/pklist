# Step Table
simple HTML5/JS filtered table tool

## Concept
Filter data in a table, one variable at a time.
A page this is loaded on has an encoded json 'filter state' object, where any variable in the data can be subselected on perfect match, regex, less/greater, or presence in a list. When the steptable is initalized, a prioritized list of filters is provided. The first variable in this list that is not in the filter state is then rendered as a filter. If all variables are accounted for, then it renders the data subject to the rules in the filter state.

## Usage
Currently, this project is in a minmal state. Accordingly, usage is restrained but simple. See demo.html for a quick example.
