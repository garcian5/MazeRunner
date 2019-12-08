setup();

function setup() {
    // Create a HTML tag to display to the user
    /*
    var navTag = document.createElement('nav');
    navTag.classList = "navbar navbar-expand-lg navbar-dark bg-dark";
    navTag.innerHTML = `
    <div>
    <a class="navbar-brand" href="#">WebGL Engine</a>
    </div
    `;

    // Insert the tag into the HMTL document
    document.getElementById('myNavBar').appendChild(navTag);
    */
}

function createSceneGui(state) {
    //get objects first
    /*
    let sideNav = document.getElementById("objectsNav");
    sideNav.innerHTML = "";

    state.objects.map((object) => {
        let objectElement = document.createElement("div");
        let objectName = document.createElement("h5");
        objectName.classList = "object-link";
        objectName.innerHTML = object.name;
        objectName.addEventListener('click', () => {
            displayObjectValues(object);
        });

        objectElement.appendChild(objectName);
        sideNav.appendChild(objectElement);
    });

    let camera = state.camera;
    let objectElement = document.createElement("div");
    let objectName = document.createElement("h5");
    objectName.classList = "object-link";
    objectName.innerHTML = camera.name;

    objectName.addEventListener('click', () => {
        let objectModel = {
            model: { ...camera },
            name: camera.name
        }

        displayObjectValues(objectModel);
    });

    objectElement.appendChild(objectName);
    sideNav.appendChild(objectElement);

    /*
    let addNav = document.getElementById("addObjectsNav");
    addNav.innerHTML = "";
    let objectTypeSelect = document.createElement("select");
    objectTypeSelect.classList = "form-control";
    objectTypeSelect.addEventListener('change', (event) => {
        handleTypeSelectChange(event);
    })

    createSelectionOptions(["Cube", "Mesh"], objectTypeSelect);

    let addNewButton = document.createElement("button");
    addNewButton.innerHTML = "New Object";
    addNewButton.classList = "btn btn-primary";
    addNewButton.addEventListener('click', () => {
        addObject(objectTypeSelect.value);
    });

    addNav.appendChild(objectTypeSelect);
    addNav.appendChild(addNewButton); */
    
}

function shaderValuesErrorCheck(programInfo) {
    let missing = [];
    //do attrib check
    Object.keys(programInfo.attribLocations).map((attrib) => {
        if (programInfo.attribLocations[attrib] === -1) {
            missing.push(attrib);
        }
    });
    //do uniform check
    Object.keys(programInfo.uniformLocations).map((attrib) => {
        if (!programInfo.uniformLocations[attrib]) {
            missing.push(attrib);
        }
    });

    if (missing.length > 0) {
        printError('Shader Location Error', 'One or more of the uniform and attribute variables in the shaders could not be located or is not being used : ' + missing);
    }
}

/**
 * A custom error function. The tag with id `webglError` must be present
 * @param  {string} tag Main description
 * @param  {string} errorStr Detailed description
 */
function printError(tag, errorStr) {
    // Create a HTML tag to display to the user
    var errorTag = document.createElement('div');
    errorTag.classList = 'alert alert-danger';
    errorTag.innerHTML = '<strong>' + tag + '</strong><p>' + errorStr + '</p>';

    // Insert the tag into the HMTL document
    document.getElementById('webglError').appendChild(errorTag);

    // Print to the console as well
    console.error(tag + ": " + errorStr);
}