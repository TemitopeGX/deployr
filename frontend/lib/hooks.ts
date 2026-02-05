import useSWR from 'swr';
import api from './api';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function useProjects() {
    const { data, error, isLoading, mutate } = useSWR('/projects', fetcher);
    return {
        projects: data?.projects || [],
        isLoading,
        isError: error,
        mutate,
    };
}

export function useRunners() {
    const { data, error, isLoading } = useSWR('/runners', fetcher);
    return {
        runners: data?.runners || [],
        isLoading,
        isError: error,
    };
}

export function useJobs() {
    const { data, error, isLoading, mutate } = useSWR('/jobs', fetcher);
    return {
        jobs: data?.jobs || [], // access 'jobs' key from response
        isLoading,
        isError: error,
        mutate,
    };
}

export function useStats() {
    // Determine stats from projects/runners if no dedicated endpoint exists
    const { projects, isLoading: projectsLoading } = useProjects();
    const { runners, isLoading: runnersLoading } = useRunners();

    // Calculate simple stats
    const totalProjects = projects.length;
    const activeRunners = runners.filter((r: any) => r.status === 'active').length;
    // Mock other stats for now or derive them
    const deploymentVelocity = 18; // Placeholder or calculate from recent jobs
    const networkHealth = "99.9%";

    return {
        stats: {
            totalProjects,
            activeRunners,
            deploymentVelocity,
            networkHealth
        },
        isLoading: projectsLoading || runnersLoading
    };
}
