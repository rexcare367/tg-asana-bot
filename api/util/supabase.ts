import { createClient } from '@supabase/supabase-js'
import { getProjects } from "./asana";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const getSetting = async () => {
    const { data, error } = await supabase.from('setting').select('*').single();
    if (error) {
        console.error('Error get settings:', error);
        return null;
    }
    return data;
}

const updateSettings = async (workspace:string, project:string) => {
    const { data, error } = await supabase
    .from('setting')
    .update({ workspace, project })
    .eq('id', '1')
    .select()
            
    if (error) {
        console.error('Error updating settings:', error);
        return null;
    }
    return data;
}

const handleValidateProject = () => {
    const projects = getProjects();
}

const handleValidateUsers = () => {
}

const getUsers = async () => {
    const {data, error} = await supabase.from("users").select('*');
    if (error) {
        console.error('Error getting users:', error);
        return null;
    }
    return data;
}

export { getSetting, updateSettings, getUsers, handleValidateProject, handleValidateUsers };