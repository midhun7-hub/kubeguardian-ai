from kubernetes import client, config

def get_pods():

    return [
        {
            "name": "backend",
            "status": "Running"
        }
    ]