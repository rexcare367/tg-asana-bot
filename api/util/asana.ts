const Asana = require("asana");
import * as dotenv from "dotenv";

dotenv.config();

const asana_token = process.env.ASANA_TOKEN || ""

let client = Asana.ApiClient.instance;
let token = client.authentications["token"];
token.accessToken = asana_token;

let tasksApiInstance = new (Asana as any).TasksApi();
let workspacesApiInstance = new (Asana as any).WorkspacesApi();
let projectsApiInstance = new Asana.ProjectsApi();
let sectionsApiInstance = new Asana.SectionsApi();

const getWorkspaces = () => {
    let opts = {
        limit: 50,
        opt_fields: "email_domains,is_organization,name,offset,path,uri",
    };
    workspacesApiInstance.getWorkspaces(opts).then(
        (result: any) => {
            console.log("API called successfully. Returned data: " + JSON.stringify(result.data, null, 2));
        },
        (error: any) => {
            console.error("getWorkspaces", error.response.body);
        }
    );
};

const getProjects = () => {
    let opts = {
        // limit: 50,
        // archived: false,
        // opt_fields:
        //     "archived,color,completed,completed_at,completed_by,completed_by.name,created_at,created_from_template,created_from_template.name,current_status,current_status.author,current_status.author.name,current_status.color,current_status.created_at,current_status.created_by,current_status.created_by.name,current_status.html_text,current_status.modified_at,current_status.text,current_status.title,current_status_update,current_status_update.resource_subtype,current_status_update.title,custom_field_settings,custom_field_settings.custom_field,custom_field_settings.custom_field.asana_created_field,custom_field_settings.custom_field.created_by,custom_field_settings.custom_field.created_by.name,custom_field_settings.custom_field.currency_code,custom_field_settings.custom_field.custom_label,custom_field_settings.custom_field.custom_label_position,custom_field_settings.custom_field.date_value,custom_field_settings.custom_field.date_value.date,custom_field_settings.custom_field.date_value.date_time,custom_field_settings.custom_field.description,custom_field_settings.custom_field.display_value,custom_field_settings.custom_field.enabled,custom_field_settings.custom_field.enum_options,custom_field_settings.custom_field.enum_options.color,custom_field_settings.custom_field.enum_options.enabled,custom_field_settings.custom_field.enum_options.name,custom_field_settings.custom_field.enum_value,custom_field_settings.custom_field.enum_value.color,custom_field_settings.custom_field.enum_value.enabled,custom_field_settings.custom_field.enum_value.name,custom_field_settings.custom_field.format,custom_field_settings.custom_field.has_notifications_enabled,custom_field_settings.custom_field.id_prefix,custom_field_settings.custom_field.is_formula_field,custom_field_settings.custom_field.is_global_to_workspace,custom_field_settings.custom_field.is_value_read_only,custom_field_settings.custom_field.multi_enum_values,custom_field_settings.custom_field.multi_enum_values.color,custom_field_settings.custom_field.multi_enum_values.enabled,custom_field_settings.custom_field.multi_enum_values.name,custom_field_settings.custom_field.name,custom_field_settings.custom_field.number_value,custom_field_settings.custom_field.people_value,custom_field_settings.custom_field.people_value.name,custom_field_settings.custom_field.precision,custom_field_settings.custom_field.representation_type,custom_field_settings.custom_field.resource_subtype,custom_field_settings.custom_field.text_value,custom_field_settings.custom_field.type,custom_field_settings.is_important,custom_field_settings.parent,custom_field_settings.parent.name,custom_field_settings.project,custom_field_settings.project.name,custom_fields,custom_fields.date_value,custom_fields.date_value.date,custom_fields.date_value.date_time,custom_fields.display_value,custom_fields.enabled,custom_fields.enum_options,custom_fields.enum_options.color,custom_fields.enum_options.enabled,custom_fields.enum_options.name,custom_fields.enum_value,custom_fields.enum_value.color,custom_fields.enum_value.enabled,custom_fields.enum_value.name,custom_fields.id_prefix,custom_fields.is_formula_field,custom_fields.multi_enum_values,custom_fields.multi_enum_values.color,custom_fields.multi_enum_values.enabled,custom_fields.multi_enum_values.name,custom_fields.name,custom_fields.number_value,custom_fields.representation_type,custom_fields.resource_subtype,custom_fields.text_value,custom_fields.type,default_access_level,default_view,due_date,due_on,followers,followers.name,html_notes,icon,members,members.name,minimum_access_level_for_customization,minimum_access_level_for_sharing,modified_at,name,notes,offset,owner,path,permalink_url,privacy_setting,project_brief,public,start_on,team,team.name,uri,workspace,workspace.name",
    };
    return projectsApiInstance.getProjects(opts).then(
        (result: any) => {
            return result.data
        },
        (error: any) => {
            console.error("getProjects", error.response.body);
        }
    );
};

const getSections = (project_gid:string) => {
    return sectionsApiInstance.getSectionsForProject(project_gid).then((result:any) => {
        // console.log('API called successfully. Returned data: ' + JSON.stringify(result.data, null, 2));
        return result.data;
    }, (error:any) => {
        console.error(error.response.body);
    });
}

const getProjectById = (id:string) => {
    return projectsApiInstance.getProject(id).then((result:any) => {
        // console.log('API called successfully. Returned data: ' + JSON.stringify(result.data, null, 2));
        return result.data;
    }, (error:any) => {
        console.error(error.response.body);
    });
}

const createTask = (body: any, opts = {}) => {
    return tasksApiInstance.createTask(body, opts).then(
        (result: any) => {
            // console.log("API called successfully. Returned data: " + JSON.stringify(result.data, null, 2));
            return result.data;
        },
        (error: any) => {
            console.error("createTask", error.response.body);
        }
    );
};

export { getWorkspaces, getProjects, getSections, createTask, getProjectById };
