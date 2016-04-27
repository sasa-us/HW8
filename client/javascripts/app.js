var main = function(toDoObjects) {
    "use strict";
    console.log("SANITY CHECK");
    var toDos = toDoObjects.map(function(toDo) {
        // just return the description(name) of this toDoObject
        //console.log("toDo.description is: ", toDo.description);
        return toDo.description;
    });

    //= https://openclassrooms.com/courses/ultra-fast-applications-using-node-js/socket-io-let-s-go-to-real-time
    //connected to the server
    var socket = io.connect('http://localhost:3000');

    // alert all clients receive broadcasting msg
    socket.on("broadcastData", function(content) {
        alert("broadcast! A new item was added", content);
        //console.log("broadcast! A new item was added", content);
        // broadcast the update in Newest 
        toDoObjects = content;
        toDos = toDoObjects.map(function(toDo) {
            return toDo.description;
        });

        var $content;
        // must have empty() to recreate
        $("main .content").empty();
        if ($(".tabs .active").text() === "Newest") {
            $content = $("<ul>");
            for (var i = toDos.length - 1; i >= 0; i--) {
                $content.append($("<li>").text(toDos[i]));
            }
            //$("main .content").append($content);
            // use slidedown need hide() first
            ($content).hide().appendTo($("main .content")).slideDown(5000);
            console.log("newest is: ", toDos);
        } //end if newest

        else if ($(".tabs .active").text() === "Oldest") {
            $content = $("<ul>");
            toDos.forEach(function(todo) {
                $content.append($("<li>").text(todo));
            });
            ($content).hide().appendTo($("main .content")).slideDown(5000);
        } //end else if oldest
        
        else if ($(".tabs .active").text() === "Tags") {
            var tags = [];
            toDoObjects.forEach(function(toDo) {
                toDo.tags.forEach(function(tag) {
                    if (tags.indexOf(tag) === -1) {
                        tags.push(tag);
                    }
                });
            });
            var tagObjects = tags.map(function(tag) {
                var toDosWithTag = [];
                toDoObjects.forEach(function(toDo) {
                    if (toDo.tags.indexOf(tag) !== -1) {
                        toDosWithTag.push(toDo.description);
                    }
                });
                return {
                    "name": tag,
                    "toDos": toDosWithTag
                };
            });
            console.log("tagObjects are: ", tagObjects);
            tagObjects.forEach(function(tag) {
                var $tagName = $("<h3>").text(tag.name),
                    $content = $("<ul>");
                tag.toDos.forEach(function(description) {
                    var $li = $("<li>").text(description);
                    $content.append($li);
                });
                $("main .content").append($tagName);
                $("main .content").append($content);
            });
        } //end if tags                
    }); // end socket.on
    // ============= when click, update content in each
    $(".tabs a span").toArray().forEach(function(element) {
        var $element = $(element);

        // create a click handler for this element
        $element.on("click", function() {
            var $content,
                $input,
                $button,
                i;

            $(".tabs a span").removeClass("active");
            $element.addClass("active");
            $("main .content").empty();
            //newest ===================================================
            if ($element.parent().is(":nth-child(1)")) {
                $content = $("<ul>");
                for (i = toDos.length - 1; i >= 0; i--) {
                    $content.append($("<li>").text(toDos[i]));
                    //console.log("press newest toDos[i] is",toDos[i]);
                }
            }
            //oldest ===================================================
            else if ($element.parent().is(":nth-child(2)")) {
                $content = $("<ul>");
                toDos.forEach(function(todo) {
                    $content.append($("<li>").text(todo));
                });
            }
            //tag ======================================================
            else if ($element.parent().is(":nth-child(3)")) {
                var tags = [];

                toDoObjects.forEach(function(toDo) {
                    toDo.tags.forEach(function(tag) {
                        if (tags.indexOf(tag) === -1) {
                            tags.push(tag);
                        }
                    });
                });
                console.log("tags are: ", tags);

                var tagObjects = tags.map(function(tag) {
                    var toDosWithTag = [];

                    toDoObjects.forEach(function(toDo) {
                        if (toDo.tags.indexOf(tag) !== -1) {
                            toDosWithTag.push(toDo.description);
                        }
                    });

                    return {
                        "name": tag,
                        "toDos": toDosWithTag
                    };
                });

                console.log("tagObjects are: ", tagObjects);

                tagObjects.forEach(function(tag) {
                    var $tagName = $("<h3>").text(tag.name),
                        $content = $("<ul>");


                    tag.toDos.forEach(function(description) {
                        var $li = $("<li>").text(description);
                        $content.append($li);
                    });

                    $("main .content").append($tagName);
                    $("main .content").append($content);
                });

            }

            //Add new todo ==============================================
            else if ($element.parent().is(":nth-child(4)")) {
                var $input = $("<input>").addClass("description"),
                    $inputLabel = $("<p>").text("Description: "),
                    $tagInput = $("<input>").addClass("tags"),
                    $tagLabel = $("<p>").text("Tags: "),
                    $button = $("<span>").text("+");

                $button.on("click", function() {
                    var description = $input.val(),
                        tags = $tagInput.val().split(","),
                        newToDo = {
                            "description": description,
                            "tags": tags
                        };

                    $.post("todos", newToDo, function(result) {
                        console.log("post todos result: ", result);

                        //toDoObjects.push(newToDo);
                        toDoObjects = result;
                        console.log("toDoObjects :", toDoObjects);
                        // update toDos
                        // ==== socket io emit msg ===============================
                        socket.emit('clientData', toDoObjects);
                        // ===================== =================================
                        toDos = toDoObjects.map(function(toDo) {
                            return toDo.description;
                        });

                        $input.val("");
                        $tagInput.val("");
                    }); // end post
                }); //end button.on

                $content = $("<div>").append($inputLabel)
                    .append($input)
                    .append($tagLabel)
                    .append($tagInput)
                    .append($button);
            }

            $("main .content").append($content);

            return false;
        }); // end  $element.on
    });

    $(".tabs a:first-child span").trigger("click");
};

$(document).ready(function() {
    // var socket = io();
    $.getJSON("todos.json", function(toDoObjects) {
        main(toDoObjects);
    });
});