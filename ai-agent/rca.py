def analyze(issue):
    rules = {
        "OOMKilled": {
            "rootCause": "Container exceeded memory limit",
            "recommendation": "Increase memory limit or optimize memory usage"
        },
        "CrashLoopBackOff": {
            "rootCause": "Application repeatedly crashing",
            "recommendation": "Check application logs and startup configuration"
        },
        "ImagePullBackOff": {
            "rootCause": "Container image unavailable",
            "recommendation": "Verify image name and registry credentials"
        },
        "DBFailure": {
            "rootCause": "Database connection failure",
            "recommendation": "Check database host and credentials"
        }
    }

    return rules.get(
        issue,
        {
            "rootCause": "Unknown",
            "recommendation": "Investigate manually"
        }
    )