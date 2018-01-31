# Assessment 2

The second assessment of the subject Front-end 3.

## Getting started 

This readme will tell you what data I used, how I made the graphs and loaded the data of the CSV files. See [Features] for the d3 library features I used. 

## Steps taken

###### 1. 
My first step was setting up a graph and seeing how it worked. Unfortunately, I used a [stacked bar chart](https://bl.ocks.org/mbostock/3886208), which didn't line up with my data. I picked a [grouped bar chart](https://bl.ocks.org/mbostock/3887051) and started over. 

###### 2. 
After seeing how the bar chart worked, I tried setting it up with my own data. My data comes from the CBS, so it wasn't usable at first. I used 
```var d = d.slice(1, d.length-1);``` to slice off the title and the footer. Then, I used 
```var keys = d.columns.slice(1);``` to slice off the category names, since I wanted these in the legend.

###### 3. 
After one day of work, I got the grouped chart as I wanted it to work. Then, I found an [example](https://bl.ocks.org/martinjc/8a2a545d5c48ef1ff65b747554332e3d) of how to load multiple datasets, with a beautiful transition. This chart works with single bars, so I had to really read and understand how to apply to my chart. 

This chart used .merge. 
```
var bars = svg.selectAll('.bar')
            .data(csv_data);

var new_bars = bars
            .enter()
          .append('rect')
            .attr('class', 'bar')
            .attr('height', 0)
            .attr('y', height)
            .attr('width', x_scale.bandwidth());

new_bars.merge(bars)
            .transition(t)
            .attr('x', function(d) {
                return x_scale(d.month);
            })
            .attr('y', function(d) {
                return y_scale(d.value);
            })
            .attr('height', function(d) {
                return height - y_scale(d.value);
            })
            .attr('fill', function(d) {
                return colour_scale(d.value);
            });
```

First, all .bar elements are selected, but they don't exist yet.
Then, in variable new_bars, the bars are finally created and the proper data is stored in them.
Finally, the bars and new_bars are merged and the attributes are given meaning from the data.

This is a beautiful way to make the bars transition into each other, but I had to find another way.

My solution was to put an eventlistener on the HTML input element and in that function, refer to the function updating the chart.
```javascript
var select = d3.select('#features');
select.on('change', function() {
    console.log(this.value);
    update(this.value);
})

update('1');
```
On eventlistener "change", the function is triggered and directs to the function update, giving the parameter of the selected "#features" value.
Under this, call the function update again, because one of these values is selected in the HTML and the graph that comes with the selected element has to be loaded. 

###### 4.
The problem I faced, was that the right dataset did load when their number was selected as value in the HTML, but the graphs were put over each other. The legend and the bars became unreadable after selecting. I puzzled over this issue for a long time. The solution I got is this:

```javascript
function update(features) {
  d3.selectAll(".bar").remove();
  d3.selectAll(".legend").remove();
```

The elements causing the problem were the legend and the bars, so after the function started I removed all of them. The elements that had to stay the same were the y and x axis. So I created them before the function started, but didn't call them so the data isn't loaded in. When the function starts, the field within the axis is emptied. After defining the dataset and putting the selected data on the right place, the y and x axis are called. Then, the bars and legend are created. 

###### 5.
In my original plan, I was going to make a bar chart as a second visualisation. This turned out to be way too much work, as I didn't get the  selection of the right columns out of the dataset. 

I did manage to create a function that listened to the clicked legend item and made a new svg within the existing svg. In this svg, I was able to print out the clicked .legenditem and remove the svg every time the function was called, so that it didn’t double print anything.

```javascript
        var selectLegend = d3.selectAll(".legenditem");
        selectLegend.on("click", function() {
          makePieChart(this);
        });
function makePieChart(e) {
          d3.selectAll(".newGraph").remove();
          d3.select("svg")
            .append("svg")
            .attr("class", "newGraph");
}
```

###### 6.

The pie chart was supposed to show the individual distribution of expenses. The grouped chart showed the comparisons between different groups of people, but it was had to see the individual comparisons. An alternative way to show this, was to show the values of just one group of people in the same bar chart. I decided to make an eventlistener on hover, which would show the linked data of the selected legend item and made the rest invisible. As the g in legend, where the rect and text is stored, was selected I should link it to the bar in the chart that holds the same value.

```javascript
.enter().append("g")
        .attr("class", "legenditem")
        .attr('id', function(d, i) { 
          return "number"+i; 
        });

.enter().append("rect")
    .attr('class', 'bar')
        .attr("id", function(d, i){ 
          return "number"+i;
        });
 ```

 I gave this id to the .legenditem based on the index, making an id that would say "#number1" if it was the second .legenditem of the dataset. I did the same for all .bar elements in the graph, so the id matches and I can link these to each other. This has to be dynamic, as I'm using multiple datasets.

```javascript
        var legendselect = d3.selectAll(".legenditem")
        legendselect.on('mouseover', function(d){
          var idNumber = this.id.toString();

          d3.selectAll(".bar")
          .attr("opacity", "0");
          d3.selectAll(".bar#"+idNumber)
          .transition()
            .duration(400)
          .attr("opacity", "1");
        });

// write a function on eventlistener mouseout to change the opacity of all .bar back to visible
        legendselect.on("mouseout", function(d){
          d3.selectAll(".bar").attr("opacity", "1");
        })


      });
```
I stored the .legenditem in a variable and wrote a function for when an eventlistener "mouseover" activates. The id of the selected .legenditem is the one I need to make this function work, so I stored it in var idNumber and put it to string. Then, I selected all the .bar elements and on mouseover, turned them invisible. All the .bar elements with the same id as the selected .legenditem will be put on visible. I can select them by selecting all ".bar#"+idNumber elements. At first, I used just a number for these id's, but it turned out the code doesn't work if the id consisted of numbers only. That's why I added "number" and turned it to string. 

Finally, I wrote another function to "mouseout" so that the bars would turn back visible. In this function, I selected all .bar elements and put them back on opacity 1.


### The dataset

The dataset I used shows expenses in relation to income of different categories, such as groceries and transportation. This is sorted on family composition, age and origin of people. The dataset works in percentages instead of integers. Integers would show bigger differences, because some groups just don't have as much to spend. While the difference in income still makes up for the difference in value, working with percentages still shows a more honest view of the distribution of values.

#### Usage in assessment 2

The visualisation shows 3 dataset, based on what the user selects from the drop-down menu. 

#### Source of the data

The data can be downloaded at: [cbs](http://statline.cbs.nl/Statweb/selection/?VW=T&DM=SLNL&PA=83679ned&D1=0&D2=0%2c203-205%2c208-211%2c215%2c220-221%2c225-226%2c228%2c231%2c234-235&D3=52-53%2c66-70&D4=l&HDR=G3%2cT%2cG2&STB=G1)

The category of expences I used are in the folder 'Afdelingen' under the folders 'Bestedingscategorieen' and then 'alle groepen'. I selected all of them, with the exception of 'Consumptiegebonden belastingen' and 'Diverse goederen en diensten'. The groups of people I selected were
 * All ages in steps of 10 years for the 1st dataset.
 * Family compositions for the 2nd dataset
 * Origin of the people for the 3rd dataset

 ## Features

* [`d3.map`](https://github.com/d3/d3-collection/blob/master/README.md#map) - mapping values in new array
* [`d3.scale`](https://github.com/d3/d3-scale) - visualiation of the abstract data
* [`d3.selection`](https://github.com/d3/d3-selection) - selecting and modifing the html

## Licence 

All the rights go to [Mike Bostock](https://b.locks.org/mbostock) for the [grouped chart](https://bl.ocks.org/mbostock/3887051) 
All rights for features used in the library go to[D3](https://d3js.org/). 
All rights for the usage of multiple datasets go to [Martin Chorley](https://bl.ocks.org/martinjc) [for this chart].(https://bl.ocks.org/martinjc/8a2a545d5c48ef1ff65b747554332e3d)
And also al rights to [@wooorm](https://github.com/wooorm) and [@Razpudding](https://github.com/Razpudding) for the example codes and the lessons on usage.



